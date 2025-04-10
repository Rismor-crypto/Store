import React from "react";

const CheckoutForm = ({ formData, errors, handleChange }) => {
  return (
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
              className={`w-full border border-gray-200 rounded-md p-2 ${
                errors.firstName ? "border-red-500" : ""
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
              className={`w-full border border-gray-200 rounded-md p-2 ${
                errors.lastName ? "border-red-500" : ""
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
            className={`w-full border border-gray-200 rounded-md p-2 ${
              errors.email ? "border-red-500" : ""
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
            className={`w-full border border-gray-200 rounded-md p-2 ${
              errors.phone ? "border-red-500" : ""
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
            className={`w-full border border-gray-200 rounded-md p-2 ${
              errors.address ? "border-red-500" : ""
            }`}
            placeholder="Enter shipping address"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CheckoutForm;