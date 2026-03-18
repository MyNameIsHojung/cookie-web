import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrderWithItems, OrderStatus } from '@/types';

export function useOrders(status?: OrderStatus) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setOrders(data as OrderWithItems[]);
    }
    setLoading(false);
  }, [status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const { error: err } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (err) throw err;
    await fetchOrders();
  };

  return { orders, loading, error, refetch: fetchOrders, updateStatus };
}
