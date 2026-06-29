// components/ui/PriceRangeFilter.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';

interface PriceRangeFilterProps {
    minValue: number | null;
    maxValue: number | null;
    onMinChange: (value: number | null) => void;
    onMaxChange: (value: number | null) => void;
    placeholder?: string;
    className?: string;
}

export default function PriceRangeFilter({
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    placeholder = 'R$',
    className = ''
}: PriceRangeFilterProps) {
    const [localMin, setLocalMin] = useState<string>(minValue?.toString() || '');
    const [localMax, setLocalMax] = useState<string>(maxValue?.toString() || '');
    const [isFocused, setIsFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLocalMin(minValue?.toString() || '');
        setLocalMax(maxValue?.toString() || '');
    }, [minValue, maxValue]);

    // Injetar CSS apenas no cliente
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const styleId = 'price-range-filter-styles';
            if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = `
                    @keyframes priceRangeFadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(-4px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .price-range-tooltip {
                        animation: priceRangeFadeIn 0.2s ease;
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }, []);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalMin(value);
        const numValue = value ? Number(value) : null;
        onMinChange(numValue);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalMax(value);
        const numValue = value ? Number(value) : null;
        onMaxChange(numValue);
    };

    const handleBlur = () => {
        setIsFocused(false);
        // Formata os valores ao perder o foco
        if (localMin && !isNaN(Number(localMin))) {
            setLocalMin(Number(localMin).toFixed(2));
        }
        if (localMax && !isNaN(Number(localMax))) {
            setLocalMax(Number(localMax).toFixed(2));
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
        // Remove formatação ao focar
        setLocalMin(localMin.replace('.', ''));
        setLocalMax(localMax.replace('.', ''));
    };

    const handleClear = () => {
        onMinChange(null);
        onMaxChange(null);
        setLocalMin('');
        setLocalMax('');
    };

    return (
        <div
            ref={containerRef}
            className={`price-range-filter ${className}`}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#F9FAFB',
                border: isFocused ? '2px solid #2563EB' : '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '4px 10px',
                minHeight: '34px',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
        >
            {/* Label R$ */}
            <span style={{
                fontSize: '0.75rem',
                color: '#6B7280',
                fontWeight: 600,
                userSelect: 'none'
            }}>
                R$
            </span>

            {/* Input Mínimo */}
            <input
                type="number"
                placeholder="0,00"
                value={localMin}
                onChange={handleMinChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                    border: 'none',
                    background: 'transparent',
                    width: '70px',
                    padding: '4px 0',
                    fontSize: '0.82rem',
                    outline: 'none',
                    color: '#111827',
                    fontWeight: 500,
                    textAlign: 'right',
                    minWidth: '50px'
                }}
            />

            {/* Separador */}
            <span style={{
                fontSize: '0.8rem',
                color: '#9CA3AF',
                fontWeight: 300,
                userSelect: 'none'
            }}>
                —
            </span>

            {/* Input Máximo */}
            <input
                type="number"
                placeholder="0,00"
                value={localMax}
                onChange={handleMaxChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                style={{
                    border: 'none',
                    background: 'transparent',
                    width: '70px',
                    padding: '4px 0',
                    fontSize: '0.82rem',
                    outline: 'none',
                    color: '#111827',
                    fontWeight: 500,
                    textAlign: 'right',
                    minWidth: '50px'
                }}
            />

            {/* Tooltip flutuante estilo Tableau */}
            {isFocused && (
                <div
                    className="price-range-tooltip"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: '0',
                        background: '#1F2937',
                        color: 'white',
                        fontSize: '0.68rem',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                >
                    {localMin || '0,00'} — {localMax || '0,00'}
                </div>
            )}

            {/* Indicador visual de range ativo */}
            {(minValue !== null || maxValue !== null) && (
                <button
                    onClick={handleClear}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#9CA3AF',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#F3F4F6';
                        e.currentTarget.style.color = '#DC2626';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#9CA3AF';
                    }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>
            )}
        </div>
    );
}