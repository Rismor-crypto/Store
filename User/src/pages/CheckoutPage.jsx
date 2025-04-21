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
  const { isWholesaleMode } = useShoppingMode(); // Check if wholesale mode is active
  console.log("Wholesale Mode:", isWholesaleMode); // Debugging line
  
  

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

  // Process order and show invoice
  const handlePlaceOrder = async () => {
    if (validateForm()) {
      setShowInvoice(true);
    }
  };

  // Complete order (save to database and generate PDF)
  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // First save the order to database
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
      
      // Save order to database first
      const savedOrder = await OrderService.createOrder(orderData, cartItems);
      setOrderId(savedOrder.order_number);
      
      // Then generate PDF
      await PDFService.generatePDF(invoiceRef.current, 'order_receipt.pdf');
      
      // Clear cart and show success page
      clearCart();
      setPageState("success");
      setShowInvoice(false);
      
    } catch (error) {
      console.error("Error processing order:", error);
      alert(`There was an error processing your order: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle return to home
  const handleReturnHome = () => {
    navigate("/");
  };

  // Render checkout page
  const renderCheckoutPage = () => (
    <main className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-10">
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
            onClose={() => setShowInvoice(false)}
            onDownloadPDF={handleDownloadPDF}
            isProcessing={isProcessing}
          />
        )}
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