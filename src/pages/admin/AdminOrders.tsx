import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import { formatPrice, formatDate, formatPhone } from '@/utils/format';
import {
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type OrderWithItems,
} from '@/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  paid: 'bg-blue-100 text-blue-700',
  preparing: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-orange-100 text-orange-700',
};

const STATUS_FLOW: OrderStatus[] = [
  'paid',
  'preparing',
  'ready',
  'completed',
];

export default function AdminOrders() {
  const { orders, loading, updateStatus } = useOrders();
  const [selected, setSelected] = useState<OrderWithItems | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    setUpdating(true);
    try {
      await updateStatus(orderId, newStatus);
      setSelected(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : '상태 변경 중 오류가 발생했습니다.',
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-plum">주문 관리</h1>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-brand-plum">
              주문 상세
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">주문번호</span>
                <span className="font-medium">{selected.order_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">주문일시</span>
                <span>{formatDate(selected.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">주문자</span>
                <span>{selected.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">연락처</span>
                <span>{formatPhone(selected.customer_phone)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">이메일</span>
                <span>{selected.customer_email}</span>
              </div>
              {selected.customer_address && (
                <div className="flex justify-between">
                  <span className="text-gray-500">주소</span>
                  <span className="text-right">
                    {selected.customer_address}
                    {selected.customer_address_detail &&
                      ` ${selected.customer_address_detail}`}
                  </span>
                </div>
              )}
              {selected.delivery_memo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">배송메모</span>
                  <span>{selected.delivery_memo}</span>
                </div>
              )}
              <hr />
              <div>
                <p className="mb-2 font-medium">주문 상품</p>
                {selected.order_items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-1"
                  >
                    <span>
                      {item.product_name} x {item.quantity}
                    </span>
                    <span>{formatPrice(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <hr />
              <div className="flex justify-between text-base font-bold">
                <span>총 결제금액</span>
                <span>{formatPrice(selected.total_amount)}</span>
              </div>

              {/* Status change */}
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-gray-500">
                  상태 변경
                </p>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FLOW.map((status) => (
                    <button
                      key={status}
                      onClick={() =>
                        handleStatusChange(selected.id, status)
                      }
                      disabled={
                        updating || selected.status === status
                      }
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-opacity ${
                        STATUS_COLORS[status]
                      } ${
                        selected.status === status
                          ? 'opacity-50'
                          : 'hover:opacity-80'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </button>
                  ))}
                  <button
                    onClick={() =>
                      handleStatusChange(selected.id, 'cancelled')
                    }
                    disabled={updating}
                    className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:opacity-80"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="btn-secondary mt-6 w-full"
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <p className="py-12 text-center text-gray-400">주문이 없습니다.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500">
                <th className="px-3 py-3">주문번호</th>
                <th className="px-3 py-3">주문자</th>
                <th className="px-3 py-3">금액</th>
                <th className="px-3 py-3">상태</th>
                <th className="px-3 py-3">주문일시</th>
                <th className="px-3 py-3">상세</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="px-3 py-3 font-mono text-xs">
                    {order.order_number}
                  </td>
                  <td className="px-3 py-3">{order.customer_name}</td>
                  <td className="px-3 py-3 font-medium">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[order.status]
                      }`}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setSelected(order)}
                      className="rounded bg-brand-teal/10 px-2 py-1 text-xs font-medium text-brand-teal hover:bg-brand-teal/20"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
