// frontend/src/components/common/DataTable.jsx

import React, { useState } from 'react';

const DataTable = ({
  columns,
  data,
  onRowClick,
  onSort,
  onFilter,
  pagination = true,
  itemsPerPage = 10
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterText, setFilterText] = useState('');

  const handleSort = (column) => {
    if (column.sortable) {
      const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
      setSortColumn(column.key);
      setSortDirection(newDirection);
      if (onSort) onSort(column.key, newDirection);
    }
  };

  const handleFilter = (e) => {
    setFilterText(e.target.value);
    setCurrentPage(1);
    if (onFilter) onFilter(e.target.value);
  };

  // Filter data
  const filteredData = data.filter(row =>
    Object.values(row).some(value =>
      String(value).toLowerCase().includes(filterText.toLowerCase())
    )
  );

  // Sort data
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (sortDirection === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
      })
    : filteredData;

  // Pagination
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : sortedData;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Search/Filter */}
      <div className="p-4 border-b border-[#8B4513]/20">
        <input
          type="text"
          placeholder="Search..."
          value={filterText}
          onChange={handleFilter}
          className="input-field max-w-xs"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#2C1810]/5">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => column.sortable && handleSort(column)}
                  className={`px-6 py-3 text-left text-sm font-semibold text-[#2C1810] ${
                    column.sortable ? 'cursor-pointer hover:bg-[#2C1810]/10' : ''
                  }`}
                >
                  <div className="flex items-center">
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="ml-2">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#8B4513]/10">
            {paginatedData.map((row, index) => (
              <tr
                key={index}
                onClick={() => onRowClick && onRowClick(row)}
                className={`hover:bg-[#F5E6D3] transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 text-sm text-[#1A1A1A]">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-[#8B4513]/20 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg ${
              currentPage === 1
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-outline'
            }`}
          >
            Previous
          </button>
          
          <span className="text-[#1A1A1A]">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg ${
              currentPage === totalPages
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'btn-outline'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable;