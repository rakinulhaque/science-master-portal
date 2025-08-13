import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useGetStudentsQuery } from '../store/api/studentsApi';
import StudentTable from '../components/dashboard/StudentTable';
import AddStudentModal from '../components/modals/AddStudentModal';
import { MagnifyingGlassIcon, FunnelIcon, PlusIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const { data: students = [], isLoading, refetch } = useGetStudentsQuery();

  const handleLogout = () => {
    dispatch(logout());
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber?.includes(searchTerm) ||
    student.schoolCollege?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Branch */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">☀</span>
                </div>
                <h1 className="ml-2 text-xl font-bold text-primary-600">SUNRISE</h1>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                Motijheel Branch
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="flex items-center text-sm text-gray-700 mr-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-primary-600 font-medium">👤</span>
                </div>
                <span>Admin.Motijheel</span>
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Student Management Portal</h2>
              <p className="text-sm text-gray-600 mt-1">
                {filteredStudents.length} records found
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-primary flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add New Entry
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
                placeholder="Search for a student"
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
            students={filteredStudents} 
            isLoading={isLoading}
            onRefresh={refetch}
          />
        </div>
      </main>

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};

export default DashboardPage;
