import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BatchModal = ({ isOpen, onClose, onSave, batch, branches }) => {
  const [formData, setFormData] = useState({
    batchCode: '',
    name: '',
    location: '',
    timing: '',
    branchId: '',
    cost: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (batch) {
      setFormData({
        batchCode: batch.batchCode || '',
        name: batch.name || '',
        location: batch.location || '',
        timing: batch.timing || '',
        branchId: batch.branchId || '',
        cost: batch.cost || ''
      });
    } else {
      setFormData({
        batchCode: '',
        name: '',
        location: '',
        timing: '',
        branchId: '',
        cost: ''
      });
    }
    setErrors({});
  }, [batch, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.batchCode.trim()) {
      newErrors.batchCode = 'Batch code is required';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Batch name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required';
    }

    if (!formData.cost || isNaN(formData.cost) || parseFloat(formData.cost) < 0) {
      newErrors.cost = 'Valid cost is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        batchCode: formData.batchCode.trim(),
        name: formData.name.trim(),
        location: formData.location.trim(),
        timing: formData.timing.trim() || null,
        branchId: parseInt(formData.branchId),
        cost: parseFloat(formData.cost)
      };
      onSave(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {batch ? 'Edit Batch' : 'Create New Batch'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Batch Code */}
            <div>
              <label htmlFor="batchCode" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Code *
              </label>
              <input
                type="text"
                id="batchCode"
                name="batchCode"
                value={formData.batchCode}
                onChange={handleInputChange}
                className={`input-field ${errors.batchCode ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="e.g., BATCH001"
              />
              {errors.batchCode && (
                <p className="mt-1 text-sm text-red-600">{errors.batchCode}</p>
              )}
            </div>

            {/* Batch Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Batch Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter batch name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Branch */}
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                Branch *
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleInputChange}
                className={`input-field ${errors.branchId ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              >
                <option value="">Select a branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.location && `(${branch.location})`}
                  </option>
                ))}
              </select>
              {errors.branchId && (
                <p className="mt-1 text-sm text-red-600">{errors.branchId}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className={`input-field ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter batch location"
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>

            {/* Timing */}
            <div>
              <label htmlFor="timing" className="block text-sm font-medium text-gray-700 mb-1">
                Timing
              </label>
              <input
                type="text"
                id="timing"
                name="timing"
                value={formData.timing}
                onChange={handleInputChange}
                className="input-field"
                placeholder="e.g., 9:00 AM - 12:00 PM"
              />
            </div>

            {/* Cost */}
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost ($) *
              </label>
              <input
                type="number"
                id="cost"
                name="cost"
                value={formData.cost}
                onChange={handleInputChange}
                className={`input-field ${errors.cost ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600">{errors.cost}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {batch ? 'Update Batch' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
