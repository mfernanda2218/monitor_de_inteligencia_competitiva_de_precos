// components/ui/ChartSkeleton.tsx
'use client';

import React from 'react';

interface ChartSkeletonProps {
    height?: number;
    className?: string;
}

export default function ChartSkeleton({ height = 200, className = '' }: ChartSkeletonProps) {
    return (
        <div
            className={`skeleton ${className}`}
            style={{
                height: height,
                width: '100%',
                borderRadius: '8px'
            }}
        />
    );
}