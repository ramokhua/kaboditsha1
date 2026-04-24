// frontend/src/components/common/FilterBar.jsx

import React from 'react';

const FilterBar = ({ filters, activeFilters, onFilterChange, className = "" }) => {
  const handleFilterClick = (filterKey, value) => {
    const currentValue = activeFilters[filterKey];
    let newValue;

    if (Array.isArray(currentValue)) {
      // Multi-select filter
      if (currentValue.includes(value)) {
        newValue = currentValue.filter(v => v !== value);
      } else {
        newValue = [...currentValue, value];
      }
    } else {
      // Single-select filter
      newValue = currentValue === value ? null : value;
    }

    onFilterChange(filterKey, newValue);
  };

  const isActive = (filterKey, value) => {
    const currentValue = activeFilters[filterKey];
    if (Array.isArray(currentValue)) {
      return currentValue.includes(value);
    }
    return currentValue === value;
  };

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <div key={filter.key} className="relative">
          <button
            onClick={() => {
              if (filter.clearable && activeFilters[filter.key]) {
                onFilterChange(filter.key, null);
              }
            }}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              activeFilters[filter.key]
                ? 'bg-[#2C1810] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter.label}
            {filter.clearable && activeFilters[filter.key] && (
              <span className="ml-1">✕</span>
            )}
          </button>
          
          {filter.options && (
            <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[150px]">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFilterClick(filter.key, option.value)}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    isActive(filter.key, option.value) ? 'bg-[#F5E6D3] text-[#2C1810]' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterBar;