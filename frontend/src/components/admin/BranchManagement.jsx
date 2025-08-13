import { useState } from 'react';
import { 
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation 
} from '../../store/api/branchesApi';
import { useGetUsersQuery } from '../../store/api/usersApi';
import BranchModal from '../modals/BranchModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const BranchManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchToDelete, setBranchToDelete] = useState(null);

  const { data: branches = [], isLoading, refetch } = useGetBranchesQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const handleCreateBranch = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleEditBranch = (branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDeleteBranch = (branch) => {
    setBranchToDelete(branch);
    setIsDeleteModalOpen(true);
  };

  const handleModalSave = async (branchData) => {
    try {
      if (selectedBranch) {
        await updateBranch({ id: selectedBranch.id, ...branchData }).unwrap();
      } else {
        await createBranch(branchData).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving branch:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBranch(branchToDelete.id).unwrap();
      setIsDeleteModalOpen(false);
      setBranchToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  const getAdminName = (branchAdminId) => {
    const admin = users.find(user => user.id === branchAdminId);
    return admin ? admin.fullName || admin.username : 'Not Assigned';
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
              <BuildingOfficeIcon className="h-8 w-8 mr-3 text-primary-600" />
              Branch Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage all branches and their administrators
            </p>
          </div>
          <button
            onClick={handleCreateBranch}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Branch
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <div key={branch.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Branch Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{branch.name}</h3>
                    <p className="text-sm text-gray-500">Branch ID: {branch.id}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBranch(branch)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Branch Details */}
              <div className="space-y-3">
                {branch.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mr-2" />
                    {branch.location}
                  </div>
                )}
                
                <div className="flex items-center text-sm text-gray-600">
                  <UserIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Admin:</span>
                  <span className="ml-1">
                    {branch.branchAdmin ? branch.branchAdmin.fullName || branch.branchAdmin.username : 'Not Assigned'}
                  </span>
                </div>

                {branch.branchAdmin && (
                  <div className="text-xs text-gray-500">
                    {branch.branchAdmin.email}
                  </div>
                )}
              </div>

              {/* Branch Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    branch.branchAdmin 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {branch.branchAdmin ? 'Active' : 'Needs Admin'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(branch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {branches.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first branch.</p>
              <button
                onClick={handleCreateBranch}
                className="btn-primary"
              >
                Create First Branch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Branch Modal */}
      <BranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        branch={selectedBranch}
        users={users}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Branch"
        message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default BranchManagement;
