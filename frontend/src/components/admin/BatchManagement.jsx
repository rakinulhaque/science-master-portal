import { useState } from 'react';
import { 
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation 
} from '../../store/api/batchesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import BatchModal from '../modals/BatchModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const BatchManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [batchToDelete, setBatchToDelete] = useState(null);

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

  const getBranchName = (branchId) => {
    const branch = branches.find(branch => branch.id === branchId);
    return branch ? branch.name : 'Unknown Branch';
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
              <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" />
              Batch Management
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage all batches across branches
            </p>
          </div>
          <button
            onClick={handleCreateBatch}
            className="btn-primary flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Batch
          </button>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {batches.map((batch) => (
          <div key={batch.id} className="card hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Batch Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                    <p className="text-sm text-gray-500">Code: {batch.batchCode}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditBatch(batch)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBatch(batch)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Batch Details */}
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Branch:</span>
                  <span className="ml-1">{batch.Branch ? batch.Branch.name : getBranchName(batch.branchId)}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-1">{batch.location}</span>
                </div>

                {batch.timing && (
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium">Timing:</span>
                    <span className="ml-1">{batch.timing}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  <span className="font-medium">Cost:</span>
                  <span className="ml-1 font-semibold text-green-600">${batch.cost}</span>
                </div>
              </div>

              {/* Batch Status */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                  <span className="text-xs text-gray-500">
                    Created: {new Date(batch.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {batches.length === 0 && (
          <div className="col-span-full">
            <div className="text-center py-12">
              <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first batch.</p>
              <button
                onClick={handleCreateBatch}
                className="btn-primary"
              >
                Create First Batch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Batch Modal */}
      <BatchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        batch={selectedBatch}
        branches={branches}
      />

      {/* Delete Confirmation Modal */}
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
