import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for fetching products with standard caching
 * Best for: Featured products, single categories, search results
 */
export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: async () => {
            const { data } = await api.get('/products', { params });
            return data;
        },
        keepPreviousData: true
    });
};

/**
 * Hook for fetching products with Infinite Scroll support
 * Best for: Main collection browsing
 */
export const useInfiniteProducts = (activeCategory, searchTerm) => {
    return useInfiniteQuery({
        queryKey: ['products', 'infinite', activeCategory, searchTerm],
        queryFn: async ({ pageParam = 1 }) => {
            const { data } = await api.get('/products', {
                params: {
                    page: pageParam,
                    limit: 12,
                    category: activeCategory !== 'All' ? activeCategory : undefined,
                    keyword: searchTerm
                }
            });
            return data;
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.page < lastPage.pages) {
                return lastPage.page + 1;
            }
            return undefined;
        },
        keepPreviousData: true
    });
};
// 3. Fetch Single Product (Cached)
export const useProduct = (id) => {
    return useQuery({
        queryKey: ['products', 'detail', id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}`);
            return data;
        },
        enabled: !!id,
    });
};
