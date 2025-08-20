import { useState, useEffect } from 'react';
import { useGetBatchesQuery } from '../../../store/api/batchesApi';
import { useGetCategoriesQuery } from '../../../store/api/categoriesApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { TrashIcon } from '@heroicons/react/24/outline';

const BatchesStep = ({ data, onUpdate, onNext, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [error, setError] = useState('');

  const { data: batches = [], isLoading } = useGetBatchesQuery();
  const { data: categories = [], isLoading: categoriesLoading } = useGetCategoriesQuery();

  // Set default category to first available category
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const availableBatches = batches;

  const filteredBatches = availableBatches.filter((batch) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      batch.name.toLowerCase().includes(q) || batch.batchCode.toLowerCase().includes(q);

    // If your ids are mixed (string/number), normalize both sides
    const matchesCategory =
      !selectedCategory || String(batch.categoryId) === String(selectedCategory);

    const matchesFilter = showSelectedOnly
      ? data.selectedBatches.some((selected) => selected.id === batch.id)
      : true;

    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleBatchToggle = (batch) => {
    const isSelected = data.selectedBatches.some((s) => s.id === batch.id);
    const newSelectedBatches = isSelected
      ? data.selectedBatches.filter((s) => s.id !== batch.id)
      : [...data.selectedBatches, batch];

    onUpdate({ selectedBatches: newSelectedBatches });
    setError('');
  };

  const handleDeselectAll = () => {
    if (data.selectedBatches.length === 0) return;
    onUpdate({ selectedBatches: [] });
    setError('');
  };

  const calculateTotals = () => {
    const totalDue = data.selectedBatches.reduce(
      (sum, batch) => sum + (Number(batch.cost) || 0),
      0
    );
    return { totalDue, initialDue: totalDue };
  };

  const handleNext = () => {
    if (data.selectedBatches.length === 0) {
      setError('You need to select at least one batch.');
      return;
    }
    onNext();
  };

  const { totalDue, initialDue } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Student Info Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {categoriesLoading ? (
              <div className="animate-pulse bg-gray-200 h-8 w-24 rounded-full"></div>
            ) : (
              categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    String(selectedCategory) === String(category.id)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-sm">👤</span>
            </div>
            <div>
              <div className="text-sm font-medium">{data.name}</div>
              <div className="text-xs text-gray-500">{data.phoneNumber}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
          placeholder="Search for a batch"
        />
      </div>

      {/* Toggle + Deselect */}
      <div className="flex items-center justify-between">
        <label className="flex items-center text-sm text-gray-600 select-none">
          <input
            type="checkbox"
            checked={showSelectedOnly}
            onChange={(e) => setShowSelectedOnly(e.target.checked)}
            className="mr-2 rounded border-gray-300"
          />
          Show selected batches only
        </label>

        <button
          type="button"
          onClick={handleDeselectAll}
          disabled={data.selectedBatches.length === 0}
          className={`flex items-center space-x-1 text-sm font-medium ${
            data.selectedBatches.length === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-red-600 hover:text-red-700'
          }`}
          title="Deselect all batches"
        >
          <TrashIcon className="h-4 w-4" />
          <span>Deselect all batches</span>
        </button>
      </div>

      {/* Batch List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const isSelected = data.selectedBatches.some((s) => s.id === batch.id);
            return (
              <div
                key={batch.id}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-50 border-primary-200'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => handleBatchToggle(batch)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleBatchToggle(batch)}
                    className="mr-3 rounded border-gray-300"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{batch.name}</div>
                    <div className="text-sm text-gray-500">({batch.batchCode})</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {Number(batch.cost).toLocaleString()} BDT
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center text-red-600 text-sm">
          <span className="mr-2">🔒</span>
          {error}
        </div>
      )}

      {/* Summary (side-by-side like the screenshot) */}
      {data.selectedBatches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Selected Batches */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                Selected Batches ({data.selectedBatches.length})
              </div>
            </div>
            <div className="text-sm text-gray-800">
              {data.selectedBatches.map((b) => b.batchCode).join(', ')}
            </div>
          </div>

          {/* Right: Dues */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Due Now</span>
              <span className="font-semibold">{Number(totalDue).toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium">Initial Due</span>
              <span className="font-semibold">{Number(initialDue).toLocaleString()} BDT</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button onClick={onBack} className="btn-secondary px-6 py-2 flex items-center">
          ← Go back
        </button>
        <button onClick={handleNext} className="btn-primary px-8 py-2 flex items-center">
          Next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default BatchesStep;
