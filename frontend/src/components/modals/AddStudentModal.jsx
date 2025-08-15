import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import InformationStep from './steps/InformationStep';
import BatchesStep from './steps/BatchesStep';
import PaymentStep from './steps/PaymentStep';

const AddStudentModal = ({ isOpen, onClose, onSuccess, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [studentData, setStudentData] = useState({
    name: '',
    phoneNumber: '',
    institution: '',
    email: '',
    photo: null,
    selectedBatches: [],
    paymentData: {
      discount: 0,
      paymentMade: 0,
    }
  });

  const steps = [
    { id: 'information', name: 'Information' },
    { id: 'batches', name: 'Batches' },
    { id: 'payment', name: 'Payment' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setStudentData({
      name: '',
      phoneNumber: '',
      institution: '',
      email: '',
      photo: null,
      selectedBatches: [],
      paymentData: {
        discount: 0,
        paymentMade: 0,
      }
    });
    onClose();
  };

  const updateStudentData = (data) => {
    setStudentData(prev => ({ ...prev, ...data }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <InformationStep
            data={studentData}
            onUpdate={updateStudentData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <BatchesStep
            data={studentData}
            onUpdate={updateStudentData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PaymentStep
            data={studentData}
            onUpdate={updateStudentData}
            onBack={handleBack}
            onSuccess={onSuccess}
            onClose={handleClose}
            user={user}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Add New Entry
              </Dialog.Title>
              <p className="text-sm text-gray-600 mt-1">
                Fill in the student information to continue
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Step Navigation */}
          <div className="px-6 py-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                    index === currentStep
                      ? 'border-primary-600 text-primary-600'
                      : index < currentStep
                      ? 'border-transparent text-gray-500'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {step.name}
                </button>
              ))}
            </nav>
          </div>

          {/* Step Content */}
          <div className="p-6">
            {renderStep()}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AddStudentModal;
