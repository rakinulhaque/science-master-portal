import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetStudentsQuery } from '../../store/api/studentsApi';
import StudentTable from '../dashboard/StudentTable';
import AddStudentModal from '../modals/AddStudentModal';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon
} from '@heroicons/react/24/outline';

const StudentManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const user = useSelector((state) => state.auth.user);
  const { data: students = [], isLoading, refetch } = useGetStudentsQuery();

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber?.includes(searchTerm) ||
    student.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Student Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredStudents.length} students found
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={user?.branchId === null}
            className={`flex items-center ${
              user?.branchId === null 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed py-2 px-4 rounded-lg font-medium' 
                : 'btn-primary'
            }`}
            title={user?.branchId === null ? 'You must be assigned to a branch to add students' : ''}
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
