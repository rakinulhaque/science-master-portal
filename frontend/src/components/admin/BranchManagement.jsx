import { useState, useMemo } from 'react';
import {
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
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
  MapPinIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

const BranchManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: branches = [], isLoading, refetch } = useGetBranchesQuery();
  const { data: users = [] } = useGetUsersQuery();
  const [createBranch] = useCreateBranchMutation();
  const [updateBranch] = useUpdateBranchMutation();
  const [deleteBranch] = useDeleteBranchMutation();

  const getAdminFromBranch = (branch) => {
    // Prefer populated object if present
    if (branch?.branchAdmin) return branch.branchAdmin;

    // Fallback: resolve by branchAdminId from users list (if your API sends only IDs sometimes)
    const adminId = branch?.branchAdminId;
    if (!adminId) return null;
    return users.find((u) => u.id === adminId) || null;
  };

  const filteredBranches = useMemo(() => {
    let list = [...branches];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((b) => {
        const name = b.name?.toLowerCase() || '';
        const location = b.location?.toLowerCase() || '';
        const admin = getAdminFromBranch(b);
        const adminName = (admin?.fullName || admin?.username || '').toLowerCase();
        const adminEmail = (admin?.email || '').toLowerCase();

        return (
          name.includes(q) ||
          location.includes(q) ||
          adminName.includes(q) ||
          adminEmail.includes(q)
        );
      });
    }

    // Sort by ID descending
    return list.sort((a, b) => b.id - a.id);
  }, [branches, users, searchTerm]);

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
          <button onClick={handleCreateBranch} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Branch
          </button>
        </div>
      </div>

      {/* Search Bar (same style as AdminManagement) */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by branch, location, or admin..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''}{' '}
            matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* List/Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filteredBranches.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBranches.map((branch) => {
                const admin = getAdminFromBranch(branch);
                return (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    {/* Branch */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <BuildingOfficeIcon className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                          <div className="text-xs text-gray-500">ID: {branch.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-700">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {branch.location || '-'}
                      </div>
                    </td>

                    {/* Admin */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {admin ? (
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {admin.fullName || admin.username}
                          </div>
                          {admin.email && (
                            <div className="flex items-center text-xs text-gray-500 mt-1">
                              <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {admin.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Not Assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          admin ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {admin ? 'Active' : 'Needs Admin'}
                      </span>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : '-'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit branch"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete branch"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : null}

        {/* Empty State */}
        {filteredBranches.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No branches found' : 'No branches yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `No branches match your search "${searchTerm}". Try a different search term.`
                : 'Get started by creating your first branch.'}
            </p>
            {!searchTerm && (
              <button
                onClick={handleCreateBranch}
                className="btn-primary flex items-center mx-auto"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add First Branch
              </button>
            )}
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
