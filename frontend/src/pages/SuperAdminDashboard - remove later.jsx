import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import BranchManagement from '../components/admin/BranchManagement';
import BatchManagement from '../components/admin/BatchManagement';
import AdminManagement from '../components/admin/AdminManagement';
import { 
  ChevronDownIcon, 
  BuildingOfficeIcon,
  UsersIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const SuperAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('branches');
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const tabs = [
    { id: 'branches', label: 'Branches', icon: BuildingOfficeIcon },
    { id: 'batches', label: 'Batches', icon: AcademicCapIcon },
    { id: 'admins', label: 'Admins', icon: UsersIcon },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'branches':
        return <BranchManagement />;
      case 'batches':
        return <BatchManagement />;
      case 'admins':
        return <AdminManagement />;
      default:
        return <BranchManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">☀</span>
                </div>
                <h1 className="ml-2 text-xl font-bold text-primary-600">SUNRISE</h1>
              </div>
              <div className="ml-8 text-sm text-gray-600">
                Super Admin Dashboard
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="flex items-center text-sm text-gray-700 mr-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                  <span className="text-primary-600 font-medium">👑</span>
                </div>
                <span>{user?.username || 'Super Admin'}</span>
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

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
