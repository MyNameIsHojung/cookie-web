import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Product, ProductCategory } from '@/types';

export function useProducts(category?: ProductCategory) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error: err } = await query;

      if (err) {
        setError(err.message);
      } else {
        setProducts(data as Product[]);
      }
      setLoading(false);
    }

    fetch();
  }, [category]);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetch() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (err) {
        setError(err.message);
      } else {
        setProduct(data as Product);
      }
      setLoading(false);
    }

    fetch();
  }, [id]);

  return { product, loading, error };
}
