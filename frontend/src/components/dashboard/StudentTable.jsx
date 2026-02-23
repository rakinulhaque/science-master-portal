import { useMemo, useState } from "react";
import {
  PencilIcon,
  DocumentIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  BanknotesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import { generateStudentPDF } from "../../utils/pdfGenerator";
import { useAddPaymentMutation } from "../../store/api/studentsApi";
import DeleteConfirmModal from "../modals/DeleteConfirmModal";
import API_CONFIG from "../../config/api";
const StudentTable = ({
  students,
  isLoading,
  pagination = {},
  currentPage,
  onPageChange,
  user,
  onRefresh,
}) => {
  // Local UI state for modals
  const [viewStudent, setViewStudent] = useState(null);
  const [collectStudent, setCollectStudent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ======= Helpers =======
  const formatCurrency = (amount) => `${(amount ?? 0).toLocaleString()} BDT`;

  const getBatchCodes = (batches) => {
    if (!Array.isArray(batches) || batches.length === 0) return "-";
    return batches.map((b) => b.batchCode).join(", ");
  };

  const calculateTotalDue = (batches) => {
    if (!Array.isArray(batches) || batches.length === 0) return 0;
    return batches.reduce((sum, b) => sum + (parseFloat(b.cost) || 0), 0);
  };

  const studentTotals = (student) => {
    // Use backend-calculated values which correctly account for discount
    const totalDue = student.initialDue ?? calculateTotalDue(student.Batches);
    const discount = parseFloat(student.discount) || 0;
    const paymentMade = student.totalPaid ??
      (student.StudentPayments?.reduce(
        (total, p) => total + (parseFloat(p.amount) || 0),
        0
      ) || 0);
    const remainingDue = student.finalDue ?? (totalDue - discount - paymentMade);
    return { totalDue, discount, paymentMade, remainingDue };
  };

  // ======= Loading & Empty =======
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        <p className="mt-2 text-gray-600">Loading students...</p>
      </div>
    );
  }

  if (!students || students.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-yellow-500 text-4xl mb-4">⚠️</div>
        <p className="text-gray-600">No data found.</p>
      </div>
    );
  }

  // ======= Pagination Controls =======
  const renderPaginationControls = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const {
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPrevPage,
    } = pagination;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      const half = Math.floor(maxVisible / 2);
      let start = Math.max(1, page - half);
      let end = Math.min(totalPages, start + maxVisible - 1);
      if (end - start + 1 < maxVisible)
        start = Math.max(1, end - maxVisible + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      return pages;
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={!hasPrevPage}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${hasPrevPage
                ? "text-gray-700 hover:bg-gray-50"
                : "text-gray-400 cursor-not-allowed"
              }`}
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasNextPage}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${hasNextPage
                ? "text-gray-700 hover:bg-gray-50"
                : "text-gray-400 cursor-not-allowed"
              }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={!hasPrevPage}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${hasPrevPage
                    ? "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    : "cursor-not-allowed"
                  }`}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </button>

              {getPageNumbers().map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pageNum === page
                      ? "z-10 bg-primary-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => onPageChange(page + 1)}
                disabled={!hasNextPage}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${hasNextPage
                    ? "hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    : "cursor-not-allowed"
                  }`}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // ======= Delete Function =======
  const deleteStudentAjax = async (studentId) => {
    try {
      // Create an AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        API_CONFIG.timeout
      );

      const baseURL = API_CONFIG.baseURL.endsWith("/")
        ? API_CONFIG.baseURL
        : `${API_CONFIG.baseURL}/`;
      const response = await fetch(`${baseURL}students/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error in deleteStudentAjax:", error);

      // Handle different types of errors
      if (error.name === "AbortError") {
        throw new Error(
          "Request timeout: The server took too long to respond. Please try again."
        );
      }

      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to the server. Please check your internet connection."
        );
      }

      throw error;
    }
  };

  // ======= Delete Confirmation =======
  const confirmStudentDelete = async () => {
    console.log(deleteTarget);
    let student = deleteTarget;
    if (!student || !student.id) {
      console.error("Invalid student data for deletion");
      //token('Invalid student data. Please try again.');
      return;
    }

    setIsDeleting(true);

    try {
      console.log(`Deleting student: ${student.name} (${student.id})`);
      // await deleteStudentAjax(student.id);

      setIsDeleteModalOpen(false);
      // setDeleteTarget(null);

      // Refresh the student list after successful deletion
      if (onRefresh) {
        onRefresh();
      }

      // Show success message
      console.log(`Successfully deleted student: ${student.name}`);
      //token(`Successfully deleted student: ${student.name}`);
    } catch (error) {
      console.error("Error deleting student:", error);

      // Show more specific error message
      let errorMessage = "Failed to delete student. Please try again.";
      if (error?.message) {
        errorMessage = error.message;
      }

      //token(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // ======= Modals =======

  // View (and edit) existing student
  const ViewStudentModal = ({ student, onClose }) => {
    if (!student) return null;
    const totals = studentTotals(student);

    return (
      <Dialog open={!!student} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-2xl bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Student Details
              </Dialog.Title>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Name</div>
                  <div className="font-medium text-gray-900">
                    {student.name}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Phone</div>
                  <div className="font-medium text-gray-900">
                    {student.phoneNumber || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Institution</div>
                  <div className="font-medium text-gray-900">
                    {student.institution || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">
                    {student.email || "—"}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">Batches</div>
                <div className="text-gray-900">
                  {getBatchCodes(student.Batches)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500">Total Due</div>
                  <div className="font-semibold">
                    {formatCurrency(totals.totalDue)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500">Payments</div>
                  <div className="font-semibold">
                    {formatCurrency(totals.paymentMade)}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500">Remaining</div>
                  <div className="font-semibold">
                    {formatCurrency(totals.remainingDue)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={onClose}
                className="btn-secondary"
                title="Close this dialog"
              >
                Close
              </button>
              <button
                className="btn-primary"
                title="Edit this student"
                onClick={() => {
                  onClose();
                  setTimeout(
                    () => setViewStudent({ ...student, __intent: "edit" }),
                    0
                  );
                }}
              >
                Edit
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  };

  // Collect Payment modal — standalone form for adding payments to existing students
  const CollectPaymentModal = ({ student, onClose }) => {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [addPayment] = useAddPaymentMutation();

    if (!student) return null;

    const totals = studentTotals(student);

    const handlePDF = async () => {
      try {
        const payments = student.StudentPayments || [];
        const dueInfo = {
          totalCost: student.initialDue ?? calculateTotalDue(student.Batches) ?? 0,
          discount: parseFloat(student.discount) || 0,
          totalPaid: totals.paymentMade,
          finalDue: totals.remainingDue,
        };
        await generateStudentPDF(student, payments, dueInfo);
      } catch (err) {
        console.error(err);
      }
    };

    const handleSubmitPayment = async () => {
      const amount = parseFloat(paymentAmount);
      if (!amount || amount <= 0) {
        alert('Please enter a valid payment amount.');
        return;
      }
      if (amount > totals.remainingDue) {
        alert(`Payment amount (${amount}) exceeds remaining due (${totals.remainingDue}).`);
        return;
      }

      setIsSubmitting(true);
      try {
        await addPayment({
          studentId: student.id,
          paymentData: {
            amount,
            date: new Date().toISOString().split('T')[0],
            note: paymentNote || 'Payment',
          }
        }).unwrap();

        setShowSuccess(true);
        setTimeout(() => {
          if (onRefresh) onRefresh();
          onClose();
        }, 1500);
      } catch (error) {
        console.error('Error adding payment:', error);
        alert(`Failed to add payment: ${error.data?.message || error.message || 'Unknown error'}`);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={!!student} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
              <Dialog.Title className="text-lg font-semibold text-gray-900">
                Collect Payment
              </Dialog.Title>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600" title="Close">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {showSuccess ? (
                <div className="text-center py-6">
                  <div className="text-green-500 text-4xl mb-2">✅</div>
                  <p className="text-lg font-semibold text-gray-900">Payment recorded successfully!</p>
                </div>
              ) : (
                <>
                  {/* Student Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm">👤</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{student.name}</div>
                      <div className="text-sm text-gray-500">{student.phoneNumber}</div>
                    </div>
                  </div>

                  {/* Due Summary */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Total Due</div>
                      <div className="font-semibold">{formatCurrency(totals.totalDue)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Paid</div>
                      <div className="font-semibold text-green-600">{formatCurrency(totals.paymentMade)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <div className="text-xs text-gray-500">Remaining</div>
                      <div className="font-semibold text-red-600">{formatCurrency(totals.remainingDue)}</div>
                    </div>
                  </div>

                  {totals.discount > 0 && (
                    <div className="text-sm text-gray-500">Discount applied: {formatCurrency(totals.discount)}</div>
                  )}

                  {/* Payment History */}
                  {student.StudentPayments && student.StudentPayments.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Payment History</div>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {student.StudentPayments.map((p) => (
                          <div key={p.id} className="flex justify-between text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded">
                            <span>#{p.installmentNumber} — {p.note || 'Payment'}</span>
                            <span className="font-medium">{formatCurrency(parseFloat(p.amount))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Payment Input */}
                  {totals.remainingDue > 0 && (
                    <div className="space-y-3 pt-2 border-t">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                        <input
                          type="number"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="w-full input-field"
                          placeholder={`Max: ${totals.remainingDue}`}
                          min="1"
                          max={totals.remainingDue}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Note (optional)</label>
                        <input
                          type="text"
                          value={paymentNote}
                          onChange={(e) => setPaymentNote(e.target.value)}
                          className="w-full input-field"
                          placeholder="e.g. 2nd installment"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50 rounded-b-lg">
              <button
                onClick={handlePDF}
                className="inline-flex items-center text-sm text-gray-700 hover:text-primary-700"
                title="Download receipt as PDF"
              >
                <DocumentIcon className="h-5 w-5 mr-1" />
                Download Receipt
              </button>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary" title="Close">Close</button>
                {!showSuccess && totals.remainingDue > 0 && (
                  <button
                    onClick={handleSubmitPayment}
                    disabled={isSubmitting || !paymentAmount}
                    className="btn-primary"
                    title="Submit payment"
                  >
                    {isSubmitting ? 'Submitting...' : 'Collect Payment'}
                  </button>
                )}
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
  };

  // ======= Table =======
  return (
    <div>
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
              const totals = studentTotals(student);

              return (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.name}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.phoneNumber}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {student.institution}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getBatchCodes(student.Batches)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(totals.totalDue)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(totals.paymentMade)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(totals.remainingDue)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* View / Edit */}
                      <button
                        onClick={() => setViewStudent(student)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded"
                        title="View & Edit student"
                        aria-label="View & Edit student"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>

                      {/* Collect Payment */}
                      <button
                        onClick={() => setCollectStudent(student)}
                        className="text-gray-400 hover:text-primary-600 p-1 rounded"
                        title="Collect a payment"
                        aria-label="Collect a payment"
                      >
                        <BanknotesIcon className="h-5 w-5" />
                      </button>

                      {/* Delete (super_admin only) */}
                      {user?.role === "super_admin" && (
                        <button
                          onClick={() => {
                            setDeleteTarget(student);
                            setIsDeleteModalOpen(true);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded"
                          title="Delete student"
                          aria-label="Delete student"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {renderPaginationControls()}

      {/* Modals */}
      <ViewStudentModal
        student={viewStudent}
        onClose={() => setViewStudent(null)}
      />
      <CollectPaymentModal
        student={collectStudent}
        onClose={() => setCollectStudent(null)}
      />
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmStudentDelete}
        title={`Delete Student: ${deleteTarget?.name || ""}`}
        message={`Are you sure you want to delete the student "${deleteTarget?.name || ""
          }"? This action cannot be undone.`}
      />
    </div>
  );
};

export default StudentTable;
