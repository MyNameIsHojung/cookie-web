import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import ProductGrid from '@/components/product/ProductGrid';

export default function Home() {
  const { products, loading } = useProducts();
  const featured = products.slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-plum via-brand-brown to-brand-olive py-24">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
            달콤한 순간
          </h1>
          <p className="mb-8 text-lg text-white/80 md:text-xl">
            정성스러운 수제 디저트로 특별한 순간을 만들어드립니다
          </p>
          <Link to="/products" className="btn-primary text-lg">
            디저트 구경하기
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: '🧁',
                title: '수제 디저트',
                desc: '매일 아침 신선한 재료로 하나하나 정성껏 만듭니다.',
              },
              {
                icon: '📦',
                title: '안전한 포장',
                desc: '디저트가 안전하게 도착할 수 있도록 꼼꼼히 포장합니다.',
              },
              {
                icon: '🚚',
                title: '빠른 배송',
                desc: '주문 후 최대한 빠르게 신선한 상태로 배송해드립니다.',
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mb-3 text-4xl">{item.icon}</div>
                <h3 className="mb-2 text-lg font-bold text-brand-plum">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-brand-plum">인기 디저트</h2>
            <Link
              to="/products"
              className="text-sm font-medium text-brand-teal hover:underline"
            >
              전체보기 &rarr;
            </Link>
          </div>
          <ProductGrid products={featured} loading={loading} />
        </div>
      </section>

      {/* About */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-brand-plum">
            달콤한 순간에 대하여
          </h2>
          <p className="leading-relaxed text-gray-600">
            저희 '달콤한 순간'은 최상의 재료만을 엄선하여 하나하나 정성껏
            디저트를 만들고 있습니다. 케이크, 쿠키, 마카롱 등 다양한 수제
            디저트를 통해 고객님의 특별한 순간을 더욱 달콤하게
            만들어드리겠습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
