import { useState, useEffect } from 'react';
import { useGetBatchesQuery } from '../../../store/api/batchesApi';
import { useGetCategoriesQuery } from '../../../store/api/categoriesApi';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

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
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);

  // Mock data for demonstration (replace with actual API data)
  const mockBatches = [
    { id: 1, name: 'Engineering Admission 2025 Batch 1', code: 'EngA25B1', cost: 7500, category: 'Engineering' },
    { id: 2, name: 'Engineering Admission 2025 Batch 2', code: 'EngA25B2', cost: 9000, category: 'Engineering' },
    { id: 3, name: 'Engineering Admission 2025 Batch 3', code: 'EngA25B3', cost: 11500, category: 'Engineering' },
    { id: 4, name: 'Engineering Admission 2025 Batch 4', code: 'EngA25B4', cost: 13000, category: 'Engineering' },
    { id: 5, name: 'University Admission 2025 Batch 1', code: 'UniA25B1', cost: 7500, category: 'University' },
    { id: 6, name: 'University Admission 2025 Batch 2', code: 'UniA25B2', cost: 9000, category: 'University' },
    { id: 7, name: 'University Admission 2025 Batch 3', code: 'UniA25B3', cost: 11500, category: 'University' },
    { id: 8, name: 'University Admission 2025 Batch 4', code: 'UniA25B4', cost: 13000, category: 'University' },
  ];

  const availableBatches = batches.length > 0 ? batches : mockBatches;

  const filteredBatches = availableBatches.filter(batch => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || batch.category === selectedCategory;
    const matchesFilter = showSelectedOnly ? 
      data.selectedBatches.some(selected => selected.id === batch.id) : true;
    
    return matchesSearch && matchesCategory && matchesFilter;
  });

  const handleBatchToggle = (batch) => {
    const isSelected = data.selectedBatches.some(selected => selected.id === batch.id);
    let newSelectedBatches;
    
    if (isSelected) {
      newSelectedBatches = data.selectedBatches.filter(selected => selected.id !== batch.id);
    } else {
      newSelectedBatches = [...data.selectedBatches, batch];
    }
    
    onUpdate({ selectedBatches: newSelectedBatches });
    setError('');
  };

  const calculateTotals = () => {
    const totalDue = data.selectedBatches.reduce((sum, batch) => sum + batch.cost, 0);
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
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.name
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

      {/* Show Selected Only Toggle */}
      <div className="flex items-center justify-end">
        <label className="flex items-center text-sm text-gray-600">
          <input
            type="checkbox"
            checked={showSelectedOnly}
            onChange={(e) => setShowSelectedOnly(e.target.checked)}
            className="mr-2 rounded border-gray-300"
          />
          Show selected batches only
        </label>
      </div>

      {/* Batch List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          filteredBatches.map((batch) => {
            const isSelected = data.selectedBatches.some(selected => selected.id === batch.id);
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
                  />
                  <div>
                    <div className="font-medium text-gray-900">{batch.name}</div>
                    <div className="text-sm text-gray-500">({batch.code})</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {batch.cost.toLocaleString()} BDT
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

      {/* Selected Batches Summary */}
      {data.selectedBatches.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600 mb-2">
            Selected Batches ({data.selectedBatches.length})
          </div>
          <div className="text-sm text-gray-800">
            {data.selectedBatches.map(batch => batch.code).join(', ')}
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm font-medium">Due Now</span>
            <span className="font-semibold">{totalDue.toLocaleString()} BDT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Initial Due</span>
            <span className="font-semibold">{initialDue.toLocaleString()} BDT</span>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="btn-secondary px-6 py-2 flex items-center"
        >
          ← Go back
        </button>
        <button
          onClick={handleNext}
          className="btn-primary px-8 py-2 flex items-center"
        >
          Next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  );
};

export default BatchesStep;
