// components/ui/Pagination.tsx
'use client';

import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    className = ''
}: PaginationProps) {
    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    return (
        <div className={`table-pagination-actions ${className}`}>
            <button
                type="button"
                className="pagination-button"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isFirstPage}
            >
                <span className="pagination-icon">‹</span>
                <span>Anterior</span>
            </button>

            <span className="table-page-count">
                <strong>{currentPage}</strong>
                <span className="separator">/</span>
                <span>{totalPages}</span>
            </span>

            <button
                type="button"
                className="pagination-button"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isLastPage}
            >
                <span>Próxima</span>
                <span className="pagination-icon">›</span>
            </button>
        </div>
    );
}