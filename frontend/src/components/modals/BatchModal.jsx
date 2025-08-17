import { useEffect, useMemo, useState } from 'react';
import { XMarkIcon, AcademicCapIcon, BuildingOfficeIcon, TagIcon, HashtagIcon } from '@heroicons/react/24/outline';
import { useGetCategoriesQuery } from '../../store/api/categoriesApi';

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : '';
};

const BatchModal = ({ isOpen, onClose, onSave, batch, branches }) => {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [batchCode, setBatchCode] = useState('');
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [branchIds, setBranchIds] = useState([]);
  const allBranchIds = useMemo(() => (Array.isArray(branches) ? branches.map(b => b.id) : []), [branches]);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    if (batch) {
      setBatchCode(batch.batchCode ?? '');
      setName(batch.name ?? '');
      setCost(batch.cost !== undefined ? toNumber(batch.cost) : '');
      setCategoryId(batch.categoryId ?? '');
      const incoming = Array.isArray(batch.branchIds) ? batch.branchIds : [];
      setBranchIds(incoming);
      setAllSelected(allBranchIds.length > 0 && incoming.length === allBranchIds.length);
    } else {
      setBatchCode('');
      setName('');
      setCost('');
      setCategoryId('');
      setBranchIds([]);
      setAllSelected(false);
    }
  }, [batch, isOpen, allBranchIds.length]);

  useEffect(() => {
    if (!allSelected) return;
    setBranchIds(allBranchIds);
  }, [allSelected, allBranchIds]);

  const parsedCost = useMemo(() => (cost === '' ? '' : Number(cost)), [cost]);

  const valid = useMemo(() => {
    if (!batchCode || !name) return false;
    if (parsedCost === '' || !Number.isFinite(parsedCost)) return false;
    if (!categoryId) return false;
    if (!Array.isArray(branchIds) || branchIds.length === 0) return false;
    return true;
  }, [batchCode, name, parsedCost, categoryId, branchIds]);

  if (!isOpen) return null;

  const toggleBranch = (id) => {
    if (allSelected) return;
    setBranchIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleToggleAll = () => {
    setAllSelected((prev) => !prev);
    if (!allSelected) {
      setBranchIds(allBranchIds);
    } else {
      setBranchIds([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      batchCode,
      name,
      cost: Number(parsedCost),
      categoryId: Number(categoryId),
      branchIds: branchIds.map(Number),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold">{batch ? 'Edit Batch' : 'Add Batch'}</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Batch Code</label>
            <div className="relative">
              <HashtagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
              <input
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border rounded-md"
                placeholder="UniA25B1, EngA25B1"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Engineering Admission 2025 Batch 1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost (BDT)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-semibold">৳</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border rounded-md"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <TagIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branches</label>

            <label className="flex items-center p-3 border rounded-md mb-2">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleToggleAll}
                className="mr-2"
              />
              <BuildingOfficeIcon className="h-4 w-4 text-gray-600 mr-2" />
              <span className="font-medium">All branches</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {branches.map((b) => (
                <label key={b.id} className={`flex items-center p-2 border rounded-md ${allSelected ? 'opacity-60 cursor-not-allowed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={branchIds.includes(b.id)}
                    onChange={() => toggleBranch(b.id)}
                    className="mr-2"
                    disabled={allSelected}
                  />
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-500 mr-2" />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!valid} className="btn-primary disabled:opacity-60">
              {batch ? 'Save Changes' : 'Create Batch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BatchModal;
