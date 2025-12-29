import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Standard fetcher for products
 */
export const fetchProducts = async (params = {}) => {
    const { data } = await api.get('/products', { params });
    return data;
};

/**
 * Hook for fetching products with standard caching and pagination support
 * Best for: Admin lists, Featured products, single categories
 */
export const useProducts = (params = {}) => {
    return useQuery({
        queryKey: ['products', params],
        queryFn: () => fetchProducts(params),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 1, // 1 minute
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

// 4. Fetch Related Products
export const useRelatedProducts = (id) => {
    return useQuery({
        queryKey: ['products', 'related', id],
        queryFn: async () => {
            const { data } = await api.get(`/products/${id}/related`);
            return data;
        },
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
