import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, totalPrice } =
    useCartStore();
  const total = totalPrice();

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-5xl">🛒</p>
        <p className="mt-4 text-lg text-gray-500">장바구니가 비어있습니다.</p>
        <Link to="/products" className="btn-primary mt-6 inline-block">
          상품 둘러보기
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-plum">장바구니</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            {/* Thumbnail */}
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {item.product.image_url ? (
                <img
                  src={item.product.image_url}
                  alt={item.product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">
                  🍰
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <Link
                to={`/products/${item.product.id}`}
                className="font-semibold text-brand-plum hover:text-brand-teal"
              >
                {item.product.name}
              </Link>
              <p className="text-sm text-brand-brown">
                {formatPrice(item.product.price)}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center rounded-lg border border-gray-200">
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity - 1)
                }
                className="px-3 py-1 text-sm hover:bg-gray-50"
              >
                -
              </button>
              <span className="min-w-[2rem] text-center text-sm font-medium">
                {item.quantity}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.product.id, item.quantity + 1)
                }
                className="px-3 py-1 text-sm hover:bg-gray-50"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <div className="w-24 text-right font-semibold text-brand-plum">
              {formatPrice(item.product.price * item.quantity)}
            </div>

            {/* Remove */}
            <button
              onClick={() => removeItem(item.product.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label="삭제"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-8 rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="flex items-center justify-between text-lg">
          <span className="font-medium text-gray-600">총 결제금액</span>
          <span className="text-2xl font-bold text-brand-plum">
            {formatPrice(total)}
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <button onClick={clearCart} className="btn-secondary flex-1">
            장바구니 비우기
          </button>
          <Link to="/checkout" className="btn-primary flex-1 text-center">
            주문하기
          </Link>
        </div>
      </div>
    </div>
  );
}
