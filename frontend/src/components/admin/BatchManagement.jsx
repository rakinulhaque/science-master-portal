// components/admin/BatchManagement.jsx
import { useMemo, useState } from 'react';
import {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} from '../../store/api/batchesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import BatchModal from '../modals/BatchModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const BatchManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Optionally pass filters: useGetBatchesQuery({ categoryId, branchId, search })
  const { data: batches = [], isLoading, refetch } = useGetBatchesQuery();
  const { data: branches = [] } = useGetBranchesQuery();

  const [createBatch] = useCreateBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();

  const handleCreateBatch = () => {
    setSelectedBatch(null);
    setIsModalOpen(true);
  };

  const handleEditBatch = (batch) => {
    setSelectedBatch(batch);
    setIsModalOpen(true);
  };

  const handleDeleteBatch = (batch) => {
    setBatchToDelete(batch);
    setIsDeleteModalOpen(true);
  };

  // Expect batchData from modal: { batchCode, name, cost, categoryId, branchIds: number[] }
  const handleModalSave = async (batchData) => {
    try {
      if (selectedBatch) {
        await updateBatch({ id: selectedBatch.id, ...batchData }).unwrap();
      } else {
        await createBatch(batchData).unwrap();
      }
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      console.error('Error saving batch:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteBatch(batchToDelete.id).unwrap();
      setIsDeleteModalOpen(false);
      setBatchToDelete(null);
      refetch();
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    const list = (batches || []).filter((b) => {
      const code = b.batchCode?.toLowerCase() || '';
      const name = b.name?.toLowerCase() || '';
      const cat = b.Category?.name?.toLowerCase() || '';
      const branchNames = (b.Branches || []).map((br) => br.name?.toLowerCase() || '').join(' ');
      return code.includes(q) || name.includes(q) || cat.includes(q) || branchNames.includes(q);
    });
    // Sort by id desc
    return list.sort((a, b) => b.id - a.id);
  }, [batches, searchTerm]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" />
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
              <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" />
              Batch Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">Manage all batches across branches</p>
          </div>
          <button onClick={handleCreateBatch} className="btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Batch
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by code, name, category, or branch..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filtered.length} batch{filtered.length !== 1 ? 'es' : ''} matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branches
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.batchCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{batch.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {batch.Category?.name || '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(batch.Branches || []).length
                      ? batch.Branches.map((br) => br.name).join(', ')
                      : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${Number(batch.cost).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {batch.createdAt ? new Date(batch.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditBatch(batch)}
                      className="text-indigo-600 hover:text-indigo-900 p-1"
                      title="Edit batch"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(batch)}
                      className="text-red-600 hover:text-red-900 p-1 ml-2"
                      title="Delete batch"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No batches found' : 'No batches yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? `No batches match your search "${searchTerm}". Try a different search term.`
                : 'Get started by creating your first batch.'}
            </p>
            {!searchTerm && (
              <button onClick={handleCreateBatch} className="btn-primary">
                <PlusIcon className="h-5 w-5 mr-2" />
                Create First Batch
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal (must provide/collect branchIds & categoryId) */}
      <BatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        batch={selectedBatch}
        branches={branches}
        // consider also passing categories if you fetch them
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Batch"
        message={`Are you sure you want to delete "${batchToDelete?.name}"? This action cannot be undone and may affect enrolled students.`}
      />
    </div>
  );
};

export default BatchManagement;
