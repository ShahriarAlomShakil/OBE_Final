import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Generic API hook using React Query
 * Provides wrappers for GET, POST, PUT, DELETE requests
 * with automatic caching, refetching, and error handling
 */

/**
 * Custom hook for GET requests using React Query
 * 
 * @param {string} queryKey - Unique key for the query (used for caching)
 * @param {string} url - API endpoint URL
 * @param {Object} options - React Query options
 * @param {Object} params - URL parameters
 * @returns {Object} React Query result with data, isLoading, error, etc.
 * 
 * @example
 * const { data, isLoading, error } = useApiQuery('courses', '/courses');
 * const { data: course } = useApiQuery(['course', id], `/courses/${id}`);
 */
export const useApiQuery = (queryKey, url, options = {}, params = {}) => {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: async () => {
      const response = await api.get(url, { params });
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes - cache retention
    retry: 1, // Retry failed requests once
    refetchOnWindowFocus: false, // Don't refetch on window focus by default
    ...options,
  });
};

/**
 * Custom hook for POST/PUT/DELETE requests using React Query Mutation
 * 
 * @param {Function} mutationFn - Function that performs the API request
 * @param {Object} options - React Query mutation options
 * @returns {Object} React Query mutation result with mutate, isLoading, error, etc.
 * 
 * @example
 * const createCourse = useApiMutation(
 *   (data) => api.post('/courses', data),
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries('courses');
 *     }
 *   }
 * );
 * createCourse.mutate({ title: 'New Course' });
 */
export const useApiMutation = (mutationFn, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onError: (error) => {
      console.error('[API Mutation Error]', error);
    },
    ...options,
    // Merge onSuccess with invalidation logic
    onSuccess: (data, variables, context) => {
      // Call user-provided onSuccess if exists
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
  });
};

/**
 * Hook for creating a resource (POST)
 * 
 * @param {string} url - API endpoint
 * @param {Object} options - Additional options
 * @returns {Object} Mutation object
 * 
 * @example
 * const createCourse = useCreate('/courses', {
 *   onSuccess: () => console.log('Course created!')
 * });
 * createCourse.mutate({ title: 'New Course' });
 */
export const useCreate = (url, options = {}) => {
  return useApiMutation(
    async (data) => {
      const response = await api.post(url, data);
      return response.data;
    },
    options
  );
};

/**
 * Hook for updating a resource (PUT/PATCH)
 * 
 * @param {string} url - Base API endpoint (can include :id placeholder)
 * @param {Object} options - Additional options
 * @param {string} method - HTTP method (PUT or PATCH)
 * @returns {Object} Mutation object
 * 
 * @example
 * const updateCourse = useUpdate('/courses/:id');
 * updateCourse.mutate({ id: 1, title: 'Updated Course' });
 */
export const useUpdate = (url, options = {}, method = 'PUT') => {
  return useApiMutation(
    async ({ id, ...data }) => {
      const endpoint = url.includes(':id') ? url.replace(':id', id) : `${url}/${id}`;
      const apiMethod = method.toLowerCase() === 'patch' ? api.patch : api.put;
      const response = await apiMethod(endpoint, data);
      return response.data;
    },
    options
  );
};

/**
 * Hook for deleting a resource (DELETE)
 * 
 * @param {string} url - Base API endpoint (can include :id placeholder)
 * @param {Object} options - Additional options
 * @returns {Object} Mutation object
 * 
 * @example
 * const deleteCourse = useDelete('/courses/:id');
 * deleteCourse.mutate(1); // Deletes course with ID 1
 */
export const useDelete = (url, options = {}) => {
  return useApiMutation(
    async (id) => {
      const endpoint = url.includes(':id') ? url.replace(':id', id) : `${url}/${id}`;
      const response = await api.delete(endpoint);
      return response.data;
    },
    options
  );
};

/**
 * Hook for fetching paginated data
 * 
 * @param {string} queryKey - Query key
 * @param {string} url - API endpoint
 * @param {Object} params - Query parameters (page, limit, etc.)
 * @param {Object} options - React Query options
 * @returns {Object} Query result with pagination data
 * 
 * @example
 * const { data, isLoading } = usePaginatedQuery(
 *   'courses',
 *   '/courses',
 *   { page: 1, limit: 10 }
 * );
 */
export const usePaginatedQuery = (queryKey, url, params = {}, options = {}) => {
  return useApiQuery(
    [queryKey, params],
    url,
    {
      keepPreviousData: true, // Keep previous page data while loading next
      ...options,
    },
    params
  );
};

/**
 * Hook for infinite scroll queries
 * 
 * @param {string} queryKey - Query key
 * @param {string} url - API endpoint
 * @param {Object} options - React Query infinite options
 * @returns {Object} Infinite query result
 * 
 * @example
 * const { data, fetchNextPage, hasNextPage } = useInfiniteQuery(
 *   'courses',
 *   '/courses',
 *   { limit: 10 }
 * );
 */
export const useInfiniteQuery = (queryKey, url, options = {}) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await api.get(url, {
        params: { page: pageParam, ...options.params },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    ...options,
  });
};

/**
 * Hook to manually invalidate and refetch queries
 * 
 * @returns {Function} Function to invalidate queries
 * 
 * @example
 * const invalidate = useInvalidateQuery();
 * invalidate('courses'); // Refetch courses query
 * invalidate(['course', 1]); // Refetch specific course
 */
export const useInvalidateQuery = () => {
  const queryClient = useQueryClient();
  
  return (queryKey) => {
    queryClient.invalidateQueries(
      Array.isArray(queryKey) ? queryKey : [queryKey]
    );
  };
};

/**
 * Hook to prefetch data
 * 
 * @returns {Function} Function to prefetch queries
 * 
 * @example
 * const prefetch = usePrefetchQuery();
 * prefetch('courses', '/courses'); // Prefetch courses
 */
export const usePrefetchQuery = () => {
  const queryClient = useQueryClient();
  
  return async (queryKey, url, params = {}) => {
    await queryClient.prefetchQuery({
      queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
      queryFn: async () => {
        const response = await api.get(url, { params });
        return response.data;
      },
    });
  };
};

export default {
  useApiQuery,
  useApiMutation,
  useCreate,
  useUpdate,
  useDelete,
  usePaginatedQuery,
  useInfiniteQuery,
  useInvalidateQuery,
  usePrefetchQuery,
};
