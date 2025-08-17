import { PencilIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { generateStudentPDF } from '../../utils/pdfGenerator';

const StudentTable = ({ students, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">No data found.</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return `${amount?.toLocaleString() || 0} BDT`;
  };

  const getBatchCodes = (batches) => {
    if (!batches || batches.length === 0) return '-';
    return batches.map(batch => batch.batchCode).join(', ');
  };

  const calculateTotalDue = (batches) => {
    if (!batches || batches.length === 0) return 0;
    return batches.reduce((total, batch) => total + (parseFloat(batch.cost) || 0), 0);
  };

  const handleDownloadPDF = async (student) => {
    try {
      // Prepare payment history
      const payments = student.StudentPayments || [];
      
      // Prepare due information
      const dueInfo = {
        totalCost: student.initialDue || 0,
        discount: student.discount || 0,
        totalPaid: payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0),
        finalDue: student.finalDue || 0
      };
      
      // Generate and download PDF
      await generateStudentPDF(student, payments, dueInfo);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <input type="checkbox" className="rounded border-gray-300" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              College
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Batches
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total Due
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Payment Made
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Remaining Due
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {students.map((student) => {
            const totalDue = calculateTotalDue(student.Batches);
            const paymentMade = student.StudentPayments?.reduce((total, payment) => 
              total + (parseFloat(payment.amount) || 0), 0) || 0;
            const remainingDue = totalDue - paymentMade;

            return (
              <tr key={student.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {student.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.phoneNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{student.institution}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {getBatchCodes(student.Batches)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(totalDue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(paymentMade)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(remainingDue)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    {/* <button className="text-gray-400 hover:text-gray-600">
                      <PencilIcon className="h-4 w-4" />
                    </button> */}
                    <button 
                      onClick={() => handleDownloadPDF(student)}
                      className="text-gray-400 hover:text-primary-600 flex items-center space-x-1 transition-colors"
                      title="Download PDF Report"
                    >
                      <span>PDF</span>
                      <DocumentIcon className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
