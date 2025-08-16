import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AdminModal = ({ isOpen, onClose, onSave, admin, branches, backendError }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    branchId: ''
  });
  const [errors, setErrors] = useState({});

  // Handle backend errors
  useEffect(() => {
    if (backendError) {
      const newErrors = { ...errors };
      
      // Check if it's a mobile duplication error
      if (backendError.toLowerCase().includes('mobile') || 
          backendError.toLowerCase().includes('phone') ||
          backendError.toLowerCase().includes('duplicate')) {
        newErrors.mobile = backendError;
      } else {
        // For other errors, show a general error
        newErrors.general = backendError;
      }
      
      setErrors(newErrors);
    }
  }, [backendError]);

  useEffect(() => {
    if (admin) {
      setFormData({
        fullName: admin.fullName || '',
        mobile: admin.mobile || '',
        password: '',
        confirmPassword: '',
        branchId: admin.branchId || ''
      });
    } else {
      setFormData({
        fullName: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        branchId: ''
      });
    }
    setErrors({});
  }, [admin, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field and general errors
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: '' // Clear general errors when user starts typing
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number is invalid';
    }

    // Password validation only for new admins or when password is provided for edit
    if (!admin || formData.password) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const submitData = {
        fullName: formData.fullName.trim(),
        mobile: formData.mobile.trim(),
        branchId: formData.branchId || null
      };

      // Only include password if it's provided (for new admins or password updates)
      if (formData.password) {
        submitData.password = formData.password;
      }

      onSave(submitData);
    }
  };

  const availableBranches = branches.filter(branch => 
    !branch.branchAdminId || branch.branchAdminId === admin?.id
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {admin ? 'Edit Admin' : 'Create New Admin'}
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
          {/* General Error Display */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`input-field ${errors.fullName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className={`input-field ${errors.mobile ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder="Enter mobile number (i.e. 016XXXXXXXX)"
              />
              {errors.mobile && (
                <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
              )}
            </div>

            {/* Branch Assignment */}
            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700 mb-1">
                Branch Assignment
              </label>
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">No branch assignment</option>
                {availableBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} {branch.location && `(${branch.location})`}
                  </option>
                ))}
              </select>
              {availableBranches.length === 0 && !admin && (
                <p className="mt-1 text-sm text-yellow-600">
                  No available branches. All branches already have assigned administrators.
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password {admin ? '(leave blank to keep current)' : '*'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`input-field ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                placeholder={admin ? "Enter new password" : "Enter password"}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            {(!admin || formData.password) && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}
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
              {admin ? 'Update Admin' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;
