import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useGetStudentsQuery } from '../store/api/studentsApi';
import StudentTable from '../components/dashboard/StudentTable';
import AddStudentModal from '../components/modals/AddStudentModal';
import BranchManagement from '../components/admin/BranchManagement';
import BatchManagement from '../components/admin/BatchManagement';
import AdminManagement from '../components/admin/AdminManagement';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PlusIcon, 
  ChevronDownIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { data: students = [], isLoading, refetch } = useGetStudentsQuery();

  const handleLogout = () => {
    dispatch(logout());
  };

  const filteredStudents = students.filter((student) =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phoneNumber?.includes(searchTerm) ||
    student.institution?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSuperAdmin = user?.role === 'super_admin';
  
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'branches', label: 'Branch Management', icon: BuildingOfficeIcon },
    { id: 'batches', label: 'Batch Management', icon: AcademicCapIcon },
    { id: 'admins', label: 'Admin Management', icon: UsersIcon },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'branches':
        return <BranchManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'admins':
        return <AdminManagement />;
      default:
        return renderDashboardContent();
    }
  };

  const renderDashboardContent = () => (
    <div className="px-6 py-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {isSuperAdmin ? 'Super Admin Dashboard' : 'Student Management Portal'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {isSuperAdmin ? 'Manage your organization' : `${filteredStudents.length} records found`}
            </p>
          </div>
          {!isSuperAdmin && (
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
              Add New Entry
            </button>
          )}
        </div>
      </div>

      {!isSuperAdmin && (
        <>
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
        </>
      )}

      {isSuperAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sidebarItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{item.label}</h3>
                    <p className="text-sm text-gray-600">Manage {item.label.toLowerCase()}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar for Super Admin */}
        {isSuperAdmin && (
          <>
            {/* Mobile sidebar backdrop */}
            {isSidebarOpen && (
              <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">☀</span>
                  </div>
                  <span className="ml-2 text-lg font-bold text-primary-600">SUNRISE</span>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-1 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="mt-4 px-4">
                <div className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-700' : 'text-gray-500'}`} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </nav>
              
              {/* User info at bottom */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-600 font-medium">👑</span>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">{user?.username || 'Super Admin'}</p>
                    <p className="text-xs text-gray-500">Super Administrator</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full text-left text-sm text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main content area */}
        <div className="flex-1 min-h-screen">
          {/* Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                {/* Logo and Branch (for non-super-admin) or mobile menu button */}
                <div className="flex items-center">
                  {isSuperAdmin && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-4"
                    >
                      <Bars3Icon className="h-6 w-6" />
                    </button>
                  )}
                  
                  {!isSuperAdmin && (
                    <>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">☀</span>
                        </div>
                        <h1 className="ml-2 text-xl font-bold text-primary-600">SUNRISE</h1>
                      </div>
                      <div className="ml-8 text-sm text-gray-600">
                        Motijheel Branch
                      </div>
                    </>
                  )}

                  {isSuperAdmin && (
                    <div className="hidden lg:block">
                      <h1 className="text-xl font-semibold text-gray-800">
                        {activeSection === 'dashboard' ? 'Dashboard' :
                         activeSection === 'branches' ? 'Branch Management' :
                         activeSection === 'batches' ? 'Batch Management' :
                         activeSection === 'admins' ? 'Admin Management' : 'Dashboard'}
                      </h1>
                    </div>
                  )}
                </div>

                {/* User Menu (for non-super-admin) */}
                {!isSuperAdmin && (
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
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {renderContent()}
          </main>
        </div>
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

export default DashboardPage;
