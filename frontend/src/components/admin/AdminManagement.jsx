import { useState } from 'react';
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
  UserCircleIcon
} from '@heroicons/react/24/outline';

const AdminManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const { data: users = [], isLoading, refetch } = useGetUsersQuery();
  const { data: branches = [] } = useGetBranchesQuery();
  const [createAdmin] = useCreateAdminMutation();
  const [updateAdmin] = useUpdateAdminMutation();
  const [deleteAdmin] = useDeleteAdminMutation();

  // Filter to show only admins (not super_admin)
  const admins = users.filter(user => user.role === 'admin');

  const handleCreateAdmin = () => {
    setSelectedAdmin(null);
    setIsModalOpen(true);
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsModalOpen(true);
  };

  const handleDeleteAdmin = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const handleModalSave = async (adminData) => {
    try {
      if (selectedAdmin) {
        await updateAdmin({ id: selectedAdmin.id, ...adminData }).unwrap();
      } else {
        await createAdmin(adminData).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving admin:', error);
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

      {/* Admins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {admins.map((admin) => (
          <div key={admin.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Admin Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <UserCircleIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{admin.fullName}</h3>
                    <p className="text-sm text-gray-500">@{admin.username}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditAdmin(admin)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAdmin(admin)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Admin Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <EnvelopeIcon className="h-4 w-4 mr-2" />
                  <span className="truncate">{admin.email}</span>
                </div>

                {admin.mobile && (
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2" />
                    <span>{admin.mobile}</span>
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Branch:</span>
                  <span className="ml-1">{getBranchName(admin.branchId)}</span>
                </div>
              </div>

              {/* Admin Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    admin.branchId 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {admin.branchId ? 'Assigned' : 'Unassigned'}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {admin.id}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Created: {new Date(admin.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {admins.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No admins found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first admin.</p>
              <button
                onClick={handleCreateAdmin}
                className="btn-primary"
              >
                Create First Admin
              </button>
            </div>
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
