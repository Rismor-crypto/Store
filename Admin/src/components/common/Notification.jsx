import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";

const Notification = ({ message, type = "info", onClose }) => {
  return (
    <div 
      className={`fixed top-4 right-4 p-4 rounded-md shadow-md z-50 flex items-center ${
        type === 'error' ? 'bg-red-100 text-red-800' :
        type === 'success' ? 'bg-green-100 text-green-800' :
        'bg-blue-100 text-blue-800'
      }`}
    >
      {type === 'error' ? (
        <AlertTriangle className="h-5 w-5 mr-2" />
      ) : (
        <Check className="h-5 w-5 mr-2" />
      )}
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-4 text-gray-500 hover:text-gray-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Notification;