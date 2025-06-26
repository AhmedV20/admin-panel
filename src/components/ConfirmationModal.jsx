import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md m-4"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title || 'Confirm Action'}</h2>
        <div className="text-gray-600 mb-8">
          {children || 'Are you sure you want to proceed?'}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 