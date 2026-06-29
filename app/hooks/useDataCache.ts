// hooks/useDataCache.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface CacheData<T> {
    data: T | null;
    timestamp: number;
    expiresIn: number;
}

const cache: Record<string, CacheData<any>> = {};

export function useDataCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    expiresIn: number = 60000 // 1 minuto
) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        try {
            // Verificar cache
            const cached = cache[key];
            if (cached && Date.now() - cached.timestamp < cached.expiresIn) {
                setData(cached.data);
                setLoading(false);
                return cached.data;
            }

            const result = await fetcher();
            cache[key] = {
                data: result,
                timestamp: Date.now(),
                expiresIn
            };
            setData(result);
            setLoading(false);
            return result;
        } catch (err) {
            setError(err as Error);
            setLoading(false);
            throw err;
        }
    }, [key, fetcher, expiresIn]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData };
}