import React from "react";


const SuccessPage = ({ onReturnHome, orderId }) => {
  return (
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
          Order Placed Successfully!
        </h1>

        <div className="text-gray-600 mb-6 space-y-3">
          {orderId && (
            <p className="font-medium">Order Number: {orderId}</p>
          )}

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
            onClick={onReturnHome}
            className="bg-blue-500 text-white px-6 py-3 rounded-xs hover:bg-blue-600 transition w-full md:w-auto cursor-pointer"
          >
            Return to Home
          </button>
          <button
            onClick={() => {
              window.location.href = `mailto:Russelcoinc@aol.com?subject=Order%20Receipt&body=Please%20find%20attached%20the%20order%20receipt%20for%20processing.%20Order%20ID:%20${orderId}`;
            }}
            className="bg-green-500 text-white px-6 py-3 rounded-xs hover:bg-green-600 transition w-full md:w-auto cursor-pointer"
          >
            Email Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;