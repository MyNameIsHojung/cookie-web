import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.totalItems);
  const count = totalItems();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const isAdmin = location.pathname.startsWith('/admin');

  const navLinks = isAdmin
    ? [
        { to: '/admin', label: '대시보드' },
        { to: '/admin/products', label: '상품 관리' },
        { to: '/admin/orders', label: '주문 관리' },
        { to: '/', label: '매장으로' },
      ]
    : [
        { to: '/', label: '홈' },
        { to: '/products', label: '상품' },
        { to: '/cart', label: `장바구니${count > 0 ? ` (${count})` : ''}` },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to={isAdmin ? '/admin' : '/'} className="flex items-center gap-2">
          <span className="text-2xl">🍪</span>
          <span className="text-xl font-bold text-brand-plum">
            {isAdmin ? '관리자' : '달콤한 순간'}
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`font-medium transition-colors hover:text-brand-teal ${
                location.pathname === link.to
                  ? 'text-brand-teal'
                  : 'text-brand-plum'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && user && (
            <button
              onClick={handleSignOut}
              className="rounded-lg bg-brand-plum/10 px-3 py-1.5 text-sm font-medium text-brand-plum hover:bg-brand-plum/20"
            >
              로그아웃
            </button>
          )}
        </nav>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="메뉴 열기"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block py-2 font-medium text-brand-plum hover:text-brand-teal"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin && user && (
            <button
              onClick={() => { setMobileOpen(false); handleSignOut(); }}
              className="mt-2 block w-full rounded-lg bg-brand-plum/10 py-2 text-sm font-medium text-brand-plum"
            >
              로그아웃
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
