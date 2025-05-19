import React from "react";

interface ErrorDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  message,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold mb-2">Error</h2>
        <p className="mb-4">{message}</p>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};
