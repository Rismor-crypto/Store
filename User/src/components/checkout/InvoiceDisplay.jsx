import React from "react";

const InvoiceDisplay = ({ 
  invoiceRef, 
  formData, 
  cartItems, 
  totalWithoutDiscount, 
  totalWithDiscount,
  getDiscountedPrice,
  onClose,
  onDownloadPDF,
  isProcessing
}) => {
  // Function to calculate savings amount for an item
  const getSavingsAmount = (item) => {
    if (item.discount && item.discount > 0) {
      return ((item.price - item.discount) * item.quantity).toFixed(2);
    }
    return "0.00";
  };

  // Function to calculate the final price for an item
  const getFinalPrice = (item) => {
    if (item.discount && item.discount > 0) {
      return (item.discount * item.quantity).toFixed(2);
    }
    return (item.price * item.quantity).toFixed(2);
  };

  return (
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
                <span className="text-[#fb2c36]">Russel</span>
                <span className="text-[#fc2c36]">co</span>
              </div>
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-xl md:text-2xl font-bold">INVOICE</h2>
              <p className="text-sm">
                Date: {new Date().toLocaleDateString()}
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

          <div>
            <table className="w-full border-collapse mb-8">
              <thead>
                <tr className="bg-[#f3f4f6]">
                  <th className="border border-[#4a5565] p-2 text-left text-sm">
                    UPC
                  </th>
                  <th className="border border-[#4a5565] p-2 text-left text-sm">
                    Description
                  </th>
                  <th className="border border-[#4a5565] p-2 text-right text-sm">
                    Quantity
                  </th>
                  <th className="border border-[#4a5565] p-2 text-right text-sm">
                    Cases
                  </th>
                  <th className="border border-[#4a5565] p-2 text-right text-sm">
                    Unit Price
                  </th>
                  <th className="border border-[#4a5565] p-2 text-right text-sm">
                    Savings
                  </th>
                  <th className="border border-[#4a5565] p-2 text-right text-sm">
                    Line Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id}>
                    <td className="border border-[#4a5565] p-2 text-sm">
                      {item.upc}
                    </td>
                    <td className="border border-[#4a5565] p-2 text-sm">
                      {item.description}
                    </td>
                    <td className="border border-[#4a5565] p-2 text-right text-sm">
                      {item.quantity}
                    </td>
                    <td className="border border-[#4a5565] p-2 text-right text-sm">
                      {Math.floor(item.quantity / item.case_pack)}
                    </td>
                    <td className="border border-[#4a5565] p-2 text-right text-sm">
                      ${item.price.toFixed(2)}
                      {item.discount && item.discount > 0 && (
                        <div className="text-xs border-[#4a5565]">
                          ${item.discount.toFixed(2)} after discount
                        </div>
                      )}
                    </td>
                    <td className="border border-[#4a5565] p-2 text-right text-sm">
                      {item.discount && item.discount > 0 
                        ? `$${getSavingsAmount(item)}`
                        : "-"
                      }
                    </td>
                    <td className="border border-[#4a5565] p-2 text-right text-sm">
                      {item.discount && item.discount > 0 ? (
                        <span>
                          ${getFinalPrice(item)}
                        </span>
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
                <span>Total Savings:</span>
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
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded w-full md:w-auto cursor-pointer"
            disabled={isProcessing}
          >
            Close
          </button>
          <button
            onClick={onDownloadPDF}
            className="bg-green-500 text-white px-4 py-2 rounded w-full md:w-auto cursor-pointer"
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Confirm Order & Download PDF"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDisplay;