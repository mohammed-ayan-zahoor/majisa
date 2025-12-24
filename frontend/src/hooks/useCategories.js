import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for fetching and caching categories
 * Since categories change rarely, we use a longer staleTime locally if needed,
 * but the global default of 1 min is also fine.
 */
export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get('/categories');
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes considered "fresh" for categories
    });
};
