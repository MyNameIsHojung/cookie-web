import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { formatPrice } from '@/utils/format';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  todayOrders: number;
  totalRevenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    todayOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [productsRes, ordersRes, todayRes] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('total_amount')
          .in('status', ['paid', 'preparing', 'ready', 'completed']),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
      ]);

      const paidOrders = ordersRes.data || [];
      setStats({
        totalProducts: productsRes.count || 0,
        totalOrders: paidOrders.length,
        todayOrders: todayRes.count || 0,
        totalRevenue: paidOrders.reduce(
          (sum, o) => sum + (o.total_amount || 0),
          0,
        ),
      });
      setLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    {
      label: '전체 상품',
      value: `${stats.totalProducts}개`,
      icon: '🧁',
      link: '/admin/products',
    },
    {
      label: '총 주문',
      value: `${stats.totalOrders}건`,
      icon: '📦',
      link: '/admin/orders',
    },
    {
      label: '오늘 주문',
      value: `${stats.todayOrders}건`,
      icon: '📋',
      link: '/admin/orders',
    },
    {
      label: '총 매출',
      value: formatPrice(stats.totalRevenue),
      icon: '💰',
      link: '/admin/orders',
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-plum">대시보드</h1>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl bg-gray-100 p-6">
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="mt-2 h-8 w-3/4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {card.label}
                </span>
                <span className="text-2xl">{card.icon}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-brand-plum">
                {card.value}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
