import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../context/CartContext";
import CheckoutForm from "../components/checkout/CheckOutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import InvoiceDisplay from "../components/checkout/InvoiceDisplay";
import SuccessPage from "../components/checkout/SuccessPage";
import OrderService from "../services/OrderService";
import PDFService from "../services/PDFService";
import { useShoppingMode } from "../context/ShoppingModeContext";

/**
 * Main checkout page component that orchestrates the checkout flow
 */
const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCartContext();
  const invoiceRef = useRef(null);
  const navigate = useNavigate();
  const { totalWithoutDiscount, totalWithDiscount } = getTotalPrice();
  const { isWholesaleMode } = useShoppingMode();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  // Page state
  const [pageState, setPageState] = useState("checkout"); // 'checkout', 'success'

  // Invoice visibility state
  const [showInvoice, setShowInvoice] = useState(false);
  
  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Order ID for success page
  const [orderId, setOrderId] = useState(null);

  // Form validation state
  const [errors, setErrors] = useState({});

  // Calculate discounted price for an item
  const getDiscountedPrice = (item) => {
    if (item.discount && item.discount > 0) {
      const discountAmount = item.price * (item.discount / 100);
      return item.price - discountAmount;
    }
    return item.price;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) 
      newErrors.lastName = "Last name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!formData.address.trim()) 
      newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Process order - this is now the main action
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Save the order to database
      const orderData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        subtotal: totalWithoutDiscount,
        discountAmount: totalWithoutDiscount - totalWithDiscount,
        totalAmount: totalWithDiscount,
        type: isWholesaleMode === true ? 'wholesale' : 'retail',
      };
      
      // Save order to database
      const savedOrder = await OrderService.createOrder(orderData, cartItems);
      setOrderId(savedOrder.order_number);
      
      // Show invoice first (this will trigger PDF generation)
      setShowInvoice(true);
      
      // Wait a moment for the invoice to render
      setTimeout(async () => {
        try {
          // Generate PDF
          if (invoiceRef.current) {
            await PDFService.generatePDF(invoiceRef.current, 'order_receipt.pdf');
          }
        } catch (pdfError) {
          console.error("Error generating PDF:", pdfError);
          // Continue with the flow even if PDF generation fails
        }
      }, 500);
      
    } catch (error) {
      console.error("Error processing order:", error);
      alert(`There was an error processing your order: ${error.message}`);
      setShowInvoice(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle closing invoice and moving to success page
  const handleCloseInvoice = () => {
    // Clear cart and show success page
    clearCart();
    setPageState("success");
    setShowInvoice(false);
  };

  // Handle return to home
  const handleReturnHome = () => {
    navigate("/");
  };

  // Render checkout page
  const renderCheckoutPage = () => (
    <main className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-10 pb-24 md:pb-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <CheckoutForm 
            formData={formData} 
            errors={errors} 
            handleChange={handleChange} 
          />

          {/* Order Summary */}
          <OrderSummary 
            cartItems={cartItems} 
            totalWithDiscount={totalWithDiscount} 
            onPlaceOrder={handlePlaceOrder}
            getDiscountedPrice={getDiscountedPrice} 
            showMobileButton={false}
            isProcessing={isProcessing}
          />
        </div>

        {/* Invoice Display */}
        {showInvoice && (
          <InvoiceDisplay 
            invoiceRef={invoiceRef}
            formData={formData}
            cartItems={cartItems}
            totalWithoutDiscount={totalWithoutDiscount}
            totalWithDiscount={totalWithDiscount}
            getDiscountedPrice={getDiscountedPrice}
            onClose={handleCloseInvoice}
            isProcessing={false} // No longer processing at this stage
            showOnlyClose={true} // Only show close button
          />
        )}
      </div>

      {/* Fixed Mobile Place Order Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-40">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-gray-600">
            Order Total
          </div>
          <div className="font-bold text-lg">
            ${totalWithDiscount.toFixed(2)}
          </div>
        </div>
        
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-red-500 text-white py-3 rounded-md hover:bg-red-600 transition font-semibold cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Place Order"}
        </button>
      </div>
    </main>
  );

  // Conditionally render the appropriate page
  return pageState === "checkout" ? (
    renderCheckoutPage()
  ) : (
    <SuccessPage onReturnHome={handleReturnHome} orderId={orderId} />
  );
};

export default CheckoutPage;