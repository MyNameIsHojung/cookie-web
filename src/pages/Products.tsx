import { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';
import { CATEGORY_LABELS, type ProductCategory } from '@/types';

const categories: (ProductCategory | 'all')[] = [
  'all',
  'cake',
  'cookie',
  'bread',
  'tart',
  'macaron',
  'chocolate',
  'other',
];

export default function Products() {
  const [selectedCategory, setSelectedCategory] = useState<
    ProductCategory | 'all'
  >('all');

  const { products, loading } = useProducts(
    selectedCategory === 'all' ? undefined : selectedCategory,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-plum">전체 상품</h1>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-brand-teal text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat === 'all' ? '전체' : CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <ProductGrid products={products} loading={loading} />
    </div>
  );
}
