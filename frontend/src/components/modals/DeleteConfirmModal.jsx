import { useEffect, useRef, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [cooldown, setCooldown] = useState(5);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setCooldown(5);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
          {cooldown > 0 && (
            <p className="text-sm text-gray-500 mt-3">Please wait {cooldown} seconds before confirming.</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (cooldown === 0) onConfirm();
            }}
            disabled={cooldown > 0}
            className={`px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition
              ${cooldown > 0 ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {cooldown > 0 ? `Delete (${cooldown})` : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
