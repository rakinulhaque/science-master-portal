import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const BranchModal = ({ isOpen, onClose, onSave, branch, users }) => {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    branchAdminId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        location: branch.location || '',
        branchAdminId: branch.branchAdminId || ''
      });
    } else {
      setFormData({
        name: '',
        location: '',
        branchAdminId: ''
      });
    }
    setErrors({});
  }, [branch, isOpen]);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        name: formData.name.trim(),
        location: formData.location.trim() || null,
        branchAdminId: formData.branchAdminId || null
      };
      onSave(submitData);
    }
  };

  const availableAdmins = users.filter(user => 
    user.role === 'admin' && 
    (!user.branchId || user.branchId === branch?.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {branch ? 'Edit Branch' : 'Create New Branch'}
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
            {/* Branch Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter branch name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Enter branch location"
              />
            </div>

            {/* Branch Admin */}
            <div>
              <label htmlFor="branchAdminId" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Administrator
              </label>
              <select
                id="branchAdminId"
                name="branchAdminId"
                value={formData.branchAdminId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select an administrator</option>
                {availableAdmins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.fullName || admin.username} ({admin.email})
                  </option>
                ))}
              </select>
              {availableAdmins.length === 0 && (
                <p className="mt-1 text-sm text-yellow-600">
                  No available administrators. All admins are already assigned to branches.
                </p>
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
              {branch ? 'Update Branch' : 'Create Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchModal;
