import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { logout } from '../store/slices/authSlice';

import BranchManagement from '../components/admin/BranchManagement';
import BatchManagement from '../components/admin/BatchManagement';
import AdminManagement from '../components/admin/AdminManagement';
import StudentManagement from '../components/admin/StudentManagement';
import CategoryManagement from '../components/admin/CategoryManagement';
import PocketCoachLogo from '../components/common/PocketCoachLogo';

import { useGetBranchesQuery } from '../store/api/branchesApi';

import {
  ChevronDownIcon,
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon,
  TagIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { section } = useParams();

  const user = useSelector((state) => state.auth.user);

  // Determine active section from URL params
  const activeSection = section || 'dashboard';

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleSectionChange = (newSection) => {
    if (newSection === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/${newSection}`);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';

  // Load branches only when needed (admin view)
  const { data: branches = [] } = useGetBranchesQuery(undefined, {
    skip: !isAdmin,
  });

  // Resolve branch name for the logged-in admin
  const adminBranchName = useMemo(() => {
    if (!isAdmin) return '';
    if (!user?.branchId) return 'Unassigned';
    const b = branches.find((br) => br.id === user.branchId);
    return b ? b.name : 'Unassigned';
  }, [isAdmin, user?.branchId, branches]);

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, access: ['super_admin'] },
    {
      id: 'students',
      label: 'Student Management',
      icon: UsersIcon,
      access: ['super_admin', 'admin'],
    },
    {
      id: 'branches',
      label: 'Branch Management',
      icon: BuildingOfficeIcon,
      access: ['super_admin'],
    },
    { id: 'batches', label: 'Batch Management', icon: AcademicCapIcon, access: ['super_admin'] },
    { id: 'categories', label: 'Category Management', icon: TagIcon, access: ['super_admin'] },
    { id: 'admins', label: 'Admin Management', icon: UsersIcon, access: ['super_admin'] },
  ].filter((item) => item.access.includes(user?.role));

  const renderDashboardContent = () => {
    // For admin role, show StudentManagement component
    if (isAdmin) {
      return <StudentManagement />;
    }

    // For super admin, show the dashboard overview
    return (
      <div className="px-6 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Super Admin Dashboard</h2>
              <p className="text-sm text-gray-600 mt-1">Manage your organization</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sidebarItems.slice(1).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
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
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'students':
        return <StudentManagement />;
      case 'branches':
        return <BranchManagement />;
      case 'categories':
        return <CategoryManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'admins':
        return <AdminManagement />;
      default:
        return renderDashboardContent();
    }
  };

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
            <div
              className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center">
                  <PocketCoachLogo size="large" className="-mb-0.5" />
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
                          handleSectionChange(item.id);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        <Icon
                          className={`h-5 w-5 mr-3 ${isActive ? 'text-primary-700' : 'text-gray-500'
                            }`}
                        />
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
                    <p className="text-sm font-medium text-gray-700">
                      {user?.username || 'Super Admin'}
                    </p>
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
                {/* Logo/Branch (non super-admin) or mobile menu button */}
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
                        <PocketCoachLogo size="medium" className="-mb-0.5" />
                      </div>
                      <div className="ml-8 text-sm text-gray-600">
                        {adminBranchName}
                      </div>
                    </>
                  )}

                  {isSuperAdmin && (
                    <div className="hidden lg:block">
                      <h1 className="text-xl font-semibold text-gray-800">
                        {activeSection === 'dashboard'
                          ? 'Dashboard'
                          : activeSection === 'branches'
                            ? 'Branch Management'
                            : activeSection === 'categories'
                              ? 'Category Management'
                              : activeSection === 'batches'
                                ? 'Batch Management'
                                : activeSection === 'admins'
                                  ? 'Admin Management'
                                  : activeSection === 'students'
                                    ? 'Student Management'
                                    : 'Dashboard'}
                      </h1>
                    </div>
                  )}
                </div>

                {/* User Menu (non super-admin) */}
                {!isSuperAdmin && (
                  <div className="flex items-center">
                    <div className="flex items-center text-sm text-gray-700 mr-4">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                        <span className="text-primary-600 font-medium">👤</span>
                      </div>
                      <span>{user?.fullName || 'Admin'}</span>
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
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
