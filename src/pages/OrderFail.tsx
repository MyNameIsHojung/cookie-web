import { Link, useSearchParams } from 'react-router-dom';

export default function OrderFail() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const message = searchParams.get('message');

  return (
    <div className="py-20 text-center">
      <p className="text-5xl">😢</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-plum">
        결제에 실패했습니다
      </h1>
      <p className="mt-2 text-gray-500">
        {message || '결제 처리 중 문제가 발생했습니다.'}
      </p>
      {code && (
        <p className="mt-1 text-sm text-gray-400">오류 코드: {code}</p>
      )}
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/cart" className="btn-secondary">
          장바구니로
        </Link>
        <Link to="/" className="btn-primary">
          홈으로
        </Link>
      </div>
    </div>
  );
}
