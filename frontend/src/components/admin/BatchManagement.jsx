import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  useGetBatchesQuery,
  useCreateBatchMutation,
  useUpdateBatchMutation,
  useDeleteBatchMutation,
} from '../../store/api/batchesApi';
import { useGetBranchesQuery } from '../../store/api/branchesApi';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi';
import BatchModal from '../modals/BatchModal';
import DeleteConfirmModal from '../modals/DeleteConfirmModal';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

const BatchManagement = () => {
  const [isCreateEditOpen, setIsCreateEditOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [batchToDelete, setBatchToDelete] = useState(null);

  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data: branches = [] } = useGetBranchesQuery();
  const { data: categories = [] } = useGetCategoriesQuery();

  // Fetch all batches without search parameters for client-side filtering
  const {
    data: allBatches = [],
    isLoading,
    isFetching,
    refetch,
  } = useGetBatchesQuery();

  const [createBatch] = useCreateBatchMutation();
  const [updateBatch] = useUpdateBatchMutation();
  const [deleteBatch] = useDeleteBatchMutation();

  const categoryOptions = useMemo(() => {
    const map = new Map();
    categories.forEach((c) => map.set(c.id, c.name));
    allBatches.forEach((b) => {
      if (b.Category) map.set(b.Category.id, b.Category.name);
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [categories, allBatches]);

  // Client-side filtering logic
  const filteredBatches = useMemo(() => {
    let filtered = [...allBatches];

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(batch => 
        batch.name.toLowerCase().includes(searchLower) ||
        batch.batchCode.toLowerCase().includes(searchLower)
      );
    }

    // Apply branch filter
    if (branchFilter) {
      filtered = filtered.filter(batch => 
        Array.isArray(batch.Branches) && 
        batch.Branches.some(branch => branch.id === branchFilter)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(batch => 
        batch.Category && batch.Category.id === categoryFilter
      );
    }

    return filtered;
  }, [allBatches, search, branchFilter, categoryFilter]);

  const openCreate = () => {
    setEditingBatch(null);
    setIsCreateEditOpen(true);
  };

  const openEdit = (batch) => {
    const branchIds = Array.isArray(batch.Branches) ? batch.Branches.map((br) => br.id) : [];
    setEditingBatch({
      id: batch.id,
      batchCode: batch.batchCode ?? '',
      name: batch.name ?? '',
      cost: Number(batch.cost ?? 0),
      categoryId: batch.Category ? batch.Category.id : '',
      branchIds,
    });
    setIsCreateEditOpen(true);
  };

  const closeCreateEdit = () => {
    setIsCreateEditOpen(false);
    setEditingBatch(null);
  };

  const handleSave = async (payload) => {
    if (editingBatch?.id) {
      await updateBatch({ id: editingBatch.id, ...payload }).unwrap();
    } else {
      await createBatch(payload).unwrap();
    }
    closeCreateEdit();
    refetch();
  };

  const openDeleteModal = (batch) => {
    setBatchToDelete(batch);
    setDeleteOpen(true);
  };

  const closeDeleteModal = useCallback(() => {
    setDeleteOpen(false);
    setBatchToDelete(null);
  }, []);

  const confirmDelete = async () => {
    if (!batchToDelete) return;
    await deleteBatch(batchToDelete.id).unwrap();
    closeDeleteModal();
    refetch();
  };

  const renderBranches = (batch) => {
    const total = branches.length || 0;
    const attached = Array.isArray(batch.Branches) ? batch.Branches.length : 0;
    if (total > 0 && attached === total) return 'All';
    if (!attached) return '—';
    return batch.Branches.map((b) => b.name).join(', ');
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  const hasData = !isFetching && filteredBatches.length > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" />
            Batch Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">Manage all batches and their branch assignments</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add New Batch
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or code"
              className="w-full pl-10 pr-3 py-2 border rounded-md"
            />
          </div>
        </div>
        <select
          value={branchFilter}
          onChange={(e) => setBranchFilter(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Data or Empty State */}
      {hasData ? (
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branches</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost (BDT)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(isFetching ? [] : filteredBatches).map((batch) => (
                <tr key={batch.id}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{batch.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{batch.batchCode}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{batch.Category ? batch.Category.name : '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{renderBranches(batch)}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">৳ {Number(batch.cost).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => openEdit(batch)}
                        className="text-gray-500 hover:text-primary-600"
                        aria-label="Edit batch"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(batch)}
                        className="text-gray-500 hover:text-red-600"
                        aria-label="Delete batch"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isFetching && filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No batches found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-10 text-center">
            <div className="w-14 h-14 rounded-full bg-purple-100 mx-auto mb-4 flex items-center justify-center">
              <BuildingOfficeIcon className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No batches found</h3>
            <p className="text-gray-500 mb-5">
              {allBatches.length > 0 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first batch.'
              }
            </p>
            <button onClick={openCreate} className="btn-primary inline-flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              {allBatches.length > 0 ? 'Create New Batch' : 'Add First Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit */}
      <BatchModal
        isOpen={isCreateEditOpen}
        onClose={closeCreateEdit}
        onSave={handleSave}
        batch={editingBatch}
        branches={branches}
      />

      {/* Delete */}
      <DeleteConfirmModal
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDelete}
        title="Delete Batch"
        message={`Are you sure you want to delete "${batchToDelete?.name ?? ''}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default BatchManagement;
