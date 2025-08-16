import { useState, useMemo } from 'react';
import { 
  useGetUsersQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useDeleteAdminMutation 
} from '../../store/api/usersApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import AdminModal from '../modals/AdminModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  UsersIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [backendError, setBackendError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const { data: branches = [] } = useGetBranchesQuery();
  const [createAdmin] = useCreateAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  // Filter to show only admins (not super_admin) and apply search
  const admins = useMemo(() => {
    const adminUsers = users.filter(user => user.role === 'admin');
    
    if (!searchTerm) return adminUsers;
    
    return adminUsers.filter(admin => {
      const searchLower = searchTerm.toLowerCase();
      if(admin.branchId !== null && admin.branchId !== '') {
        branchName = getBranchName(admin.branchId).toLowerCase();
}     
      return (
        admin.fullName?.toLowerCase().includes(searchLower) ||
        admin.mobile?.toLowerCase().includes(searchLower) ||
        (admin.branchId && branchName.includes(searchLower))
      );
    });
  }, [users, searchTerm, branches]);

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setBackendError(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setBackendError(null);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleModalSave = async (adminData) => {
    try {
      setBackendError(null);
      if (selectedAdmin) {
        await updateAdmin({ id: selectedAdmin.id, ...adminData }).unwrap();
      } else {
        await createAdmin(adminData).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving admin:', error);
      
      // Extract error message from backend response
      let errorMessage = 'An error occurred while saving the admin.';
      
      if (error?.data?.message) {
        errorMessage = error.data.message;
      } else if (error?.data?.error) {
        errorMessage = error.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setBackendError(errorMessage);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAdmin(adminToDelete.id).unwrap();
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const getBranchName = (branchId) => {
    // Handle null, undefined, or empty branchId
    if (!branchId) {
      return 'Unassigned';
    }
    
    const branch = branches.find(branch => branch.id === branchId);
    return branch ? branch.name : 'Unassigned';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <UsersIcon className="h-8 w-8 mr-3 text-primary-600" />
              Admin Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage admin users and their branch assignments
            </p>
          </div>
          <button
            onClick={handleCreateAdmin}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Admin
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or branch..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {admins.length} admin{admins.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Admins List */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {admins.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{admin.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {admin.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.email}</div>
                    {admin.mobile && (
                      <div className="text-sm text-gray-500">{admin.mobile}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getBranchName(admin.branchId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.branchId && admin.branchId !== '' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {admin.branchId && admin.branchId !== '' ? 'Assigned' : 'Unassigned'}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      Created: {new Date(admin.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="text-indigo-600 hover:text-indigo-900 p-1"
                        title="Edit admin"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Delete admin"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {/* Empty State */}
        {admins.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No admins found' : 'No admins yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No admins match your search "${searchTerm}". Try a different search term.`
                : 'Get started by creating your first admin.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateAdmin}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Admin
              </button>
            )}
          </div>
        )}
      </div>

      {/* Admin Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        admin={selectedAdmin}
        branches={branches}
        backendError={backendError}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Admin"
        message={`Are you sure you want to delete admin "${adminToDelete?.fullName}"? This action cannot be undone and will remove their access to the system.`}
      />
    </div>
  );
};

export default AdminManagement;
