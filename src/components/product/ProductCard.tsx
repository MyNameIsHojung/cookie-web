import { Link } from 'react-router-dom';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stock <= 0 || !product.is_available;

  return (
    <div className="card group">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">
              🍰
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-full bg-white px-4 py-1 text-sm font-bold text-brand-plum">
                품절
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product.id}`}>
          <h3 className="mb-1 font-semibold text-brand-plum transition-colors hover:text-brand-teal">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="mb-2 line-clamp-2 text-sm text-gray-500">
            {product.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-brand-brown">
            {formatPrice(product.price)}
          </span>
          <button
            onClick={() => addItem(product)}
            disabled={outOfStock}
            className="rounded-lg bg-brand-teal px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            담기
          </button>
        </div>
      </div>
    </div>
  );
}
