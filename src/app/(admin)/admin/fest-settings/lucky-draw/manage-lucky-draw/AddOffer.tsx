// app/admin/manage-lucky-draw/AddOffer.tsx
import React, { useState } from "react";

interface AddOfferProps {
  onClose: () => void;
}

const AddOffer: React.FC<AddOfferProps> = ({ onClose }) => {
  const [offerType, setOfferType] = useState("");
  const [offerDetails, setOfferDetails] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your backend
    console.log({ offerType, offerDetails });
    alert("Offer added successfully!");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full"
      id="my-modal"
    >
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Add New Offer
          </h3>
          <form className="mt-2 text-left" onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="offerType"
              >
                Offer Type
              </label>
              <select
                id="offerType"
                value={offerType}
                onChange={(e) => setOfferType(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select an offer type</option>
                <option value="fixed">Fixed Offer</option>
                <option value="base">Base Offer</option>
                <option value="specific">Specific Offer</option>
              </select>
            </div>
            <div className="mb-4">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="offerDetails"
              >
                Offer Details
              </label>
              <textarea
                id="offerDetails"
                value={offerDetails}
                onChange={(e) => setOfferDetails(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows={3}
                required
              ></textarea>
            </div>
            <div className="items-center px-4 py-3">
              <button
                id="ok-btn"
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                Add Offer
              </button>
            </div>
          </form>
          <button
            onClick={onClose}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddOffer;
