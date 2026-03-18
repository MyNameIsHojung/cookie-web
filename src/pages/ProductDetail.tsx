import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/utils/format';
import { CATEGORY_LABELS } from '@/types';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error } = useProduct(id);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="animate-pulse">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200" />
              <div className="h-6 w-1/4 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <p className="text-5xl">😢</p>
        <p className="mt-4 text-lg text-gray-500">상품을 찾을 수 없습니다.</p>
        <Link to="/products" className="btn-primary mt-4 inline-block">
          상품 목록으로
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0 || !product.is_available;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-brand-teal">
          홈
        </Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-brand-teal">
          상품
        </Link>
        <span className="mx-2">/</span>
        <span className="text-brand-plum">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center text-8xl">
              🍰
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="inline-block rounded-full bg-brand-sage/20 px-3 py-1 text-xs font-medium text-brand-sage">
            {CATEGORY_LABELS[product.category]}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-brand-plum">
            {product.name}
          </h1>
          <p className="mt-4 text-3xl font-bold text-brand-brown">
            {formatPrice(product.price)}
          </p>

          {product.description && (
            <p className="mt-6 leading-relaxed text-gray-600">
              {product.description}
            </p>
          )}

          <div className="mt-6">
            <p className="text-sm text-gray-500">
              재고: {outOfStock ? '품절' : `${product.stock}개 남음`}
            </p>
          </div>

          {!outOfStock && (
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center rounded-lg border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-lg hover:bg-gray-50"
                >
                  -
                </button>
                <span className="min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-lg hover:bg-gray-50"
                >
                  +
                </button>
              </div>
              <button onClick={handleAddToCart} className="btn-primary flex-1">
                {added ? '장바구니에 담겼습니다!' : '장바구니 담기'}
              </button>
            </div>
          )}

          {outOfStock && (
            <button disabled className="btn-primary mt-6 w-full opacity-50">
              품절된 상품입니다
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
