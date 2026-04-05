import { useState, useEffect } from 'react';
import { getMyOrders } from '../api/api';
import { useAuth } from '../context/AppContext';

/**
 * useOrderHistory
 * Fetches the authenticated user's past orders.
 * Returns an empty array (no loading spinner) if the user is not logged in.
 *
 * @returns {{ orders, loading, error }}
 */
export function useOrderHistory() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyOrders()
      .then((r) => {
        if (!cancelled) setOrders(r.data.data.orders || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load orders');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Cleanup: prevent setState after unmount
    return () => { cancelled = true; };
  }, [user]);

  return { orders, loading, error };
}

export default useOrderHistory;
