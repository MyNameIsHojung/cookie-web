import type { Product } from '@/types';
import ProductCard from './ProductCard';

interface Props {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4">
              <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
              <div className="mb-3 h-4 w-full rounded bg-gray-100" />
              <div className="h-6 w-1/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        <p className="text-5xl">🧁</p>
        <p className="mt-4 text-lg">등록된 상품이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
