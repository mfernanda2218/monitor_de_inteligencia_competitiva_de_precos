import React, { useState } from 'react';

interface Column {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface AnalyticsTableProps {
  columns: Column[];
  data: any[];
  onRowClick?: (row: any) => void;
  className?: string;
}

export default function AnalyticsTable({ 
  columns, 
  data, 
  onRowClick,
  className = '' 
}: AnalyticsTableProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    }
    return bStr.localeCompare(aStr);
  });

  const getAlignStyle = (align?: string) => {
    switch (align) {
      case 'center': return { textAlign: 'center' as const };
      case 'right': return { textAlign: 'right' as const };
      default: return { textAlign: 'left' as const };
    }
  };

  return (
    <div className={`table-frame ${className}`}>
      <div className="table-scroll">
        <table className="table" style={{ margin: 0 }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  style={{
                    ...getAlignStyle(column.align),
                    width: column.width,
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: '#F9FAFB'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F3F4F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#F9FAFB';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {column.header}
                    {sortColumn === column.key && (
                      <span style={{ fontSize: '0.625rem' }}>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                onClick={() => onRowClick?.(row)}
                style={{
                  cursor: onRowClick ? 'pointer' : 'default'
                }}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    style={getAlignStyle(column.align)}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: '#6B7280',
          fontSize: '0.875rem'
        }}>
          Nenhum dado disponível
        </div>
      )}
    </div>
  );
}
