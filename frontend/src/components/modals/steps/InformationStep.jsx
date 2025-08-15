import { useState } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, TrashIcon } from '@heroicons/react/24/outline';

const InformationStep = ({ data, onUpdate, onNext }) => {
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);

  const handleInputChange = (field, value) => {
    onUpdate({ [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      onUpdate({ photo: file });
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    onUpdate({ photo: null });
    setPhotoPreview(null);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!data.name?.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!data.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    
    if (!data.institution?.trim()) {
      newErrors.college = 'College is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      {/* Full Name */}
      <div>
        <input
          type="text"
          value={data.name || ''}
          onChange={(e) => handleInputChange('name', e.target.value)}
          className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
          placeholder="Full name"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <input
          type="tel"
          value={data.phoneNumber || ''}
          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
          className={`input-field ${errors.phoneNumber ? 'border-red-300 focus:ring-red-500' : ''}`}
          placeholder="Phone number"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
        )}
      </div>

      {/* College */}
      <div>
        <input
          type="text"
          value={data.institution || ''}
          onChange={(e) => handleInputChange('institution', e.target.value)}
          className={`input-field ${errors.college ? 'border-red-300 focus:ring-red-500' : ''}`}
          placeholder="College"
        />
        {errors.college && (
          <p className="mt-1 text-sm text-red-600">{errors.college}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <input
          type="email"
          value={data.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="input-field"
          placeholder="Email address (optional)"
        />
      </div>

      {/* Photo Upload */}
      <div>
        <div className="flex items-center space-x-4">
          {photoPreview || data.photo ? (
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                <img
                  src={photoPreview || (data.photo ? URL.createObjectURL(data.photo) : '')}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  {data.photo?.name || 'Scanned_File_12.jpg'}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <button
                    type="button"
                    onClick={() => document.getElementById('photo-upload').click()}
                    className="text-sm text-blue-600 hover:text-blue-500 flex items-center"
                  >
                    <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                    Re-upload
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-sm text-red-600 hover:text-red-500 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete Photo
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <PhotoIcon className="h-6 w-6 text-gray-400" />
              </div>
              <button
                type="button"
                onClick={() => document.getElementById('photo-upload').click()}
                className="ml-4 text-sm text-blue-600 hover:text-blue-500"
              >
                Upload photo (optional)
              </button>
            </div>
          )}
        </div>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          className="hidden"
        />
      </div>

      {/* Validation Error */}
      {Object.keys(errors).length > 0 && (
        <div className="flex items-center text-red-600 text-sm">
          <span className="mr-2">🔒</span>
          You need to fill all required fields.
        </div>
      )}

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="btn-primary px-8 py-2 flex items-center"
        >
          Next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default InformationStep;
