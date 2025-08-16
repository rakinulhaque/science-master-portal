import { useState } from 'react';
import { useCreateStudentMutation, useAddPaymentMutation } from '../../../store/api/studentsApi';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const PaymentStep = ({ data, onUpdate, onBack, onSuccess, onClose, user }) => {
  const [discount, setDiscount] = useState(0);
  const [paymentMade, setPaymentMade] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [createStudent] = useCreateStudentMutation();
  const [addPayment] = useAddPaymentMutation();

  const calculateTotals = () => {
    const initialDue = data.selectedBatches.reduce((sum, batch) => sum + batch.cost, 0);
    const totalDue = initialDue - discount;
    const remainingDue = totalDue - paymentMade;
    
    return { initialDue, totalDue, remainingDue };
  };

  const { initialDue, totalDue, remainingDue } = calculateTotals();

  const handleConfirm = async () => {
    setIsSubmitting(true);
    
    try {
      // Create student with batch associations
      const studentPayload = {
        name: data.name,
        phoneNumber: data.phoneNumber,
        institution: data.institution,
        email: data.email || null,
        photo: data.photo ? 'uploaded_photo.jpg' : null, // In real app, upload photo first
        batchIds: data.selectedBatches.map(batch => batch.id),
        coachingBranchId: user?.branchId,
        discount: discount > 0 ? discount : 0, // Add discount to student creation
      };

      const studentResult = await createStudent(studentPayload).unwrap();
      
      // Add payment if any payment was made
      if (paymentMade > 0) {
        console.log('Adding payment:', {
          studentId: studentResult.id,
          paymentData: {
            amount: paymentMade,
            date: new Date().toISOString().split('T')[0],
            note: 'Initial payment',
          }
        });
        
        const paymentResult = await addPayment({
          studentId: studentResult.id,
          paymentData: {
            amount: paymentMade,
            date: new Date().toISOString().split('T')[0],
            note: 'Initial payment',
          }
        }).unwrap();
        
        console.log('Payment result:', paymentResult);
      }

      // Show success state
      setShowSuccess(true);
      
      // Auto close after 2 seconds
      setTimeout(() => {
        onSuccess();
      }, 2000);
      
    } catch (error) {
      console.error('Error creating student or payment:', error);
      if (error.data) {
        console.error('Error details:', error.data);
      }
      alert(`Failed to create student or process payment: ${error.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Student Added Successfully!
        </h3>
        <p className="text-gray-600 mb-4">
          {data.name} has been added to the system.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="text-sm text-green-800">
            ✅ New entry has been added successfully.
          </div>
        </div>
        {paymentMade > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              💳 Payment has been completed successfully.
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="flex items-center justify-between">
        <div className="text-orange-600 text-sm flex items-center">
          <span className="mr-2">⚠️</span>
          Payment information cannot be changed once submitted.
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div>
              <div className="text-sm font-medium">{data.name}</div>
              <div className="text-xs text-gray-500">{data.phoneNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="space-y-4">
        {/* Initial Due */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-700">Initial due</span>
          </div>
          <span className="font-semibold text-gray-900">
            {initialDue.toLocaleString()} BDT
          </span>
        </div>

        {/* Discount */}
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">Discount (optional)</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            className="w-48 input-field text-right"
            placeholder="Enter a discount amount"
            min="0"
            max={initialDue}
          />
        </div>

        {/* Total Due */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-700">Total due</span>
          </div>
          <span className="font-semibold text-gray-900">
            {totalDue.toLocaleString()} BDT
          </span>
        </div>

        {/* Payment Made */}
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700">Payment made</label>
          <input
            type="number"
            value={paymentMade}
            onChange={(e) => setPaymentMade(Number(e.target.value) || 0)}
            className="w-48 input-field text-right"
            placeholder="Enter a payment amount"
            min="0"
            max={totalDue}
          />
        </div>

        {/* Remaining Due */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
            <span className="font-medium text-gray-700">Remaining due</span>
          </div>
          <span className="font-semibold text-gray-900">
            {remainingDue.toLocaleString()} BDT
          </span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary px-6 py-2 flex items-center"
          disabled={isSubmitting}
        >
          ← Go back
        </button>
        <button
          onClick={handleConfirm}
          disabled={isSubmitting}
          className="btn-primary px-8 py-2 flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              ✓ Confirm
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentStep;
