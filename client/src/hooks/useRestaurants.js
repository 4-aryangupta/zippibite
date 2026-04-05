import { useState, useEffect, useCallback, useRef } from 'react';
import { getRestaurants } from '../api/api';

/**
 * useRestaurants
 * Centralised hook for fetching and filtering restaurant data.
 *
 * @param {string} q  - Optional search query string (stable primitive — avoids object reference churn)
 * @returns {{ restaurants, filtered, loading, error, filterByCuisine, activeCuisine, refetch }}
 */
export function useRestaurants(q = '') {
  const [restaurants,   setRestaurants]   = useState([]);
  const [filtered,      setFiltered]      = useState([]);
  const [activeCuisine, setActiveCuisine] = useState('all');
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const abortRef = useRef(null);

  const fetch = useCallback(async () => {
    // Cancel any in-flight request from StrictMode double-invoke or re-render
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);
    try {
      const params = q ? { q } : {};
      const r = await getRestaurants(params);
      const list = r.data.data.restaurants || [];
      setRestaurants(list);
      setFiltered(list);
      setActiveCuisine('all');
    } catch (err) {
      if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
      setError(err?.response?.data?.message || 'Failed to load restaurants');
    } finally {
      if (!abortRef.current?.signal?.aborted) setLoading(false);
    }
  }, [q]); // stable: q is a primitive string

  useEffect(() => { fetch(); }, [fetch]);

  const filterByCuisine = useCallback((cuisine) => {
    setActiveCuisine(cuisine);
    if (cuisine === 'all') {
      setFiltered(restaurants);
    } else {
      setFiltered(
        restaurants.filter((r) =>
          r.cuisine.some((c) => c.toLowerCase().includes(cuisine.toLowerCase()))
        )
      );
    }
  }, [restaurants]);

  return {
    restaurants,
    filtered,
    loading,
    error,
    activeCuisine,
    filterByCuisine,
    refetch: fetch,
  };
}

export default useRestaurants;
