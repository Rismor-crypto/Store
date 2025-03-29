import React, { useState, useRef } from "react";
import { useCartContext } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const { cartItems, getTotalPrice, clearCart } = useCartContext();
  const invoiceRef = useRef(null);
  const navigate = useNavigate();
  const { totalWithoutDiscount, totalWithDiscount } = getTotalPrice();

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
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

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

    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Generate PDF and complete order
  const generatePDFAndCompleteOrder = async () => {
    // if (validateForm()) {
      // Show invoice
      setShowInvoice(true);
    // }
  };

  // Separate PDF download function
  const downloadPDF = async () => {
    const element = invoiceRef.current;
    if (!element) {
      return;
    }
  
    try {
      // Import html2pdf dynamically
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
  
      // Set configuration options
      const options = {
        margin: 10,
        filename: 'order_receipt.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
          logging: false,
          onclone: (clonedDoc) => {
            // Make sure the cloned element has explicit width
            const clonedElement = clonedDoc.querySelector('.invoice-container');
            if (clonedElement) {
              clonedElement.style.width = `${element.offsetWidth}px`;
              // Remove any max-height constraints in the clone
              clonedElement.style.maxHeight = 'none';
              clonedElement.style.overflow = 'visible';
            }
          }
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };
  
      // Generate and save PDF
      await html2pdf().from(element).set(options).save();
      
      
      // Uncomment these lines when ready to proceed after download
      clearCart();
      setPageState("success");
      setShowInvoice(false);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating your PDF. Please try again.");
    }
  };
    // Clear cart and navigate to success page
    // clearCart();
    // setPageState("success");
    // setShowInvoice(false);


  // Render checkout page
  const renderCheckoutPage = () => (
    <main className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-xs border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Personal Information</h2>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full border border-gray-200 rounded-md p-2 ${errors.firstName ? "border-red-500" : ""
                      }`}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full border border-gray-200 rounded-md p-2 ${errors.lastName ? "border-red-500" : ""
                      }`}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border border-gray-200 rounded-md p-2 ${errors.email ? "border-red-500" : ""
                    }`}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full border border-gray-200 rounded-md p-2 ${errors.phone ? "border-red-500" : ""
                    }`}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full border border-gray-200 rounded-md p-2 ${errors.address ? "border-red-500" : ""
                    }`}
                  placeholder="Enter shipping address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address}</p>
                )}
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xs p-4 sm:p-6 border border-gray-200">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              {/* Order Items */}
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1 mb-2 sm:mb-0">
                    <span className="font-medium">{item.description}</span>
                    <span className="text-gray-500 text-sm">x{item.quantity}</span>
                  </div>

                  <div className="text-right">
                    {item.discount && item.discount > 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="line-through text-gray-400 text-sm">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="font-medium">
                          ${(getDiscountedPrice(item) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="flex justify-between items-center font-bold border-t border-gray-200 pt-4 mt-2">
                <span>Total</span>
                <span className="text-lg">${totalWithDiscount.toFixed(2)}</span>
              </div>

              {/* Place Order Button */}
              <button
                onClick={generatePDFAndCompleteOrder}
                className="w-full bg-red-500 text-white py-3 rounded-md mt-4 hover:bg-red-600 transition font-medium"
              >
                Place Order
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Display */}
        {showInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 md:p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-auto">
              <div
                ref={invoiceRef}
                className="invoice-container p-4"
                style={{
                  backgroundColor: "#ffffff",
                  color: "#000000",
                }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="mb-4 md:mb-0">
                    <div className="text-2xl font-bold">
                      <span className="text-[#fb2c36]">RUSSEL</span>
                      <span className="text-[#000000]">CO</span>
                    </div>
                    <p className="text-sm md:text-base">
                      Wholesale Produce Distributor
                    </p>
                  </div>
                  <div className="text-center md:text-right">
                    <h2 className="text-xl md:text-2xl font-bold">INVOICE</h2>
                    <p className="text-sm">
                      Date: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-sm">
                      Invoice #: {Math.floor(Math.random() * 10000)}
                    </p>
                  </div>
                </div>

                <div className="grid mb-8">
                  <div className="mb-4 md:mb-0">
                    <h3 className="font-bold">Bill To:</h3>
                    <p><span className="text-[#4a5565]">Name:</span> {formData.firstName} {formData.lastName}</p>
                    <p><span className="text-[#4a5565]">Email:</span> {formData.email}</p>
                    <p><span className="text-[#4a5565]">Phone:</span> {formData.phone}</p>
                    <p><span className="text-[#4a5565]">Address:</span> {formData.address}</p>
                  </div>
                </div>

                <div className="">
                  <table className="w-full border-collapse mb-8">
                    <thead>
                      <tr className="bg-[#f3f4f6]">
                        <th className="border border-[#4a5565] p-2 text-left text-sm">
                          UPC
                        </th>
                        <th className="border border-[#4a5565] p-2 text-left text-sm ">
                          Description
                        </th>
                        <th className="border border-[#4a5565] p-2 text-right text-sm ">
                          Quantity
                        </th>
                        <th className="border border-[#4a5565] p-2 text-right text-sm ">
                          Unit Price
                        </th>
                        <th className="border border-[#4a5565] p-2 text-right text-sm ">
                          Discount
                        </th>
                        <th className="border border-[#4a5565] p-2 text-right text-sm ">
                          Line Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border border-[#4a5565] p-2 text-sm ">
                            {item.upc}
                          </td>
                          <td className="border border-[#4a5565] p-2 text-sm ">
                            {item.description}
                          </td>
                          <td className="border border-[#4a5565] p-2 text-right text-sm ">
                            {item.quantity}
                          </td>
                          <td className="border border-[#4a5565] p-2 text-right text-sm ">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="border border-[#4a5565] p-2 text-right text-sm ">
                            {item.discount ? `${item.discount}%` : "-"}
                          </td>
                          <td className="border border-[#4a5565] p-2 text-right text-sm ">
                            {item.discount && item.discount > 0 ? (
                              <>
                                <span>
                                  $
                                  {(
                                    getDiscountedPrice(item) * item.quantity
                                  ).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span>
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end">
                  <div className="w-full md:w-1/3">
                    <div className="flex justify-between p-1">
                      <span>Subtotal:</span>
                      <span>${totalWithoutDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-b p-1">
                      <span>Discount:</span>
                      <span>${(totalWithoutDiscount - totalWithDiscount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold p-1">
                      <span>Total Due:</span>
                      <span>${totalWithDiscount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-sm text-[#4a5565] text-center">
                  <p>Thank you for your business!</p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row justify-center mt-4 space-y-2 md:space-y-0 md:space-x-4">
                <button
                  onClick={() => setShowInvoice(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded w-full md:w-auto"
                >
                  Close
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto"
                >
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );

  // Render success page
  const renderSuccessPage = () => (
    <div className="bg-white min-h-screen flex items-center justify-center px-4">
      <div className="rounded-xs p-8 md:p-12 max-w-lg w-full border border-gray-200 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-20 w-20 mx-auto text-green-500 mb-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>

        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          Downloaded Successfully!
        </h1>

        <div className="text-gray-600 mb-6 space-y-3">

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <h2 className="font-bold mb-2">Next Steps</h2>
            <ul className="list-disc list-inside text-left">
              <li>Your receipt has been downloaded</li>
              <li>
                Share the receipt with the Russelco team to process your order
                offline
              </li>
              <li>You can email the receipt to: Russelcoinc@aol.com</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center space-y-3 md:space-y-0 md:space-x-4">
          <button
            onClick={() => {
              navigate("/");
            }}
            className="bg-blue-500 text-white px-6 py-3 rounded-xs hover:bg-blue-600 transition w-full md:w-auto cursor-pointer"
          >
            Return to Home
          </button>
          <button
            onClick={() => {
              // Open email client with pre-filled details
              window.location.href = `mailto:Russelcoinc@aol.com?subject=Order%20Receipt&body=Please%20find%20attached%20the%20order%20receipt%20for%20processing.`;
            }}
            className="bg-green-500 text-white px-6 py-3 rounded-xs hover:bg-green-600 transition w-full md:w-auto cursor-pointer"
          >
            Email Receipt
          </button>
        </div>
      </div>
    </div>
  );

  // Render based on page state
  return pageState === "checkout" ? renderCheckoutPage() : renderSuccessPage();
};

export default CheckoutPage;
