import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetStudentsQuery } from '../../store/api/studentsApi';
import StudentTable from '../dashboard/StudentTable';
import AddStudentModal from '../modals/AddStudentModal';
import { UsersIcon, MagnifyingGlassIcon, FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';

const StudentManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const user = useSelector((state) => state.auth.user);
  const adminWithoutBranch = user?.branchId === null;
  const isNotSuperAdmin = user?.role !== 'super_admin';

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const {
    data: studentsResponse,
    isLoading,
    refetch,
  } = useGetStudentsQuery({
    page: currentPage,
    limit: 15,
    search: debouncedSearchTerm,
    branchId: user?.branchId || '',
  });

  const students = studentsResponse?.data || [];
  const pagination = studentsResponse?.pagination || {};

  return (
    <div className="px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-primary-600" />
              Student Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {pagination.totalCount || 0} students found
              {pagination.totalCount > 0 && (
                <span className="ml-2">
                  (Page {pagination.currentPage} of {pagination.totalPages})
                </span>
              )}
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={adminWithoutBranch && isNotSuperAdmin}
            className={`flex items-center ${
              adminWithoutBranch && isNotSuperAdmin
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed py-2 px-4 rounded-lg font-medium'
                : 'btn-primary'
            }`}
            title={
              adminWithoutBranch && isNotSuperAdmin
                ? 'You must be assigned to a branch to add students'
                : ''
            }
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Student
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
              placeholder="Search students by name, phone number, or college"
            />
          </div>
        </div>
        <button className="btn-secondary flex items-center">
          <span className="mr-2">📊</span>
          Columns
        </button>
        <button className="btn-secondary flex items-center">
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filter
        </button>
      </div>

      {/* Student Table */}
      <div className="card">
        <StudentTable
          students={students}
          isLoading={isLoading}
          onRefresh={refetch}
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          user={user}
        />
      </div>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
        user={user}
      />
    </div>
  );
};

export default StudentManagement;
