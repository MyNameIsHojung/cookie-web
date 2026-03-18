import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useCartStore } from '@/store/cartStore';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('orderId');
  const paymentKey = searchParams.get('paymentKey');
  const amount = searchParams.get('amount');

  useEffect(() => {
    async function confirmPayment() {
      if (!orderId || !paymentKey || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        return;
      }

      try {
        // Edge Function으로 결제 검증
        const { data, error: fnError } = await supabase.functions.invoke(
          'confirm-payment',
          {
            body: { orderId, paymentKey, amount: Number(amount) },
          },
        );

        if (fnError) throw fnError;
        if (!data?.success) throw new Error(data?.message || '결제 검증 실패');

        setVerified(true);
        clearCart();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : '결제 확인 중 오류가 발생했습니다.';
        setError(message);
      }
    }

    confirmPayment();
  }, [orderId, paymentKey, amount, clearCart]);

  if (error) {
    return (
      <div className="py-20 text-center">
        <p className="text-5xl">😢</p>
        <h1 className="mt-4 text-2xl font-bold text-brand-plum">
          결제 확인 실패
        </h1>
        <p className="mt-2 text-gray-500">{error}</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  if (!verified) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-brand-teal" />
        <p className="mt-4 text-gray-500">결제를 확인하고 있습니다...</p>
      </div>
    );
  }

  return (
    <div className="py-20 text-center">
      <p className="text-5xl">🎉</p>
      <h1 className="mt-4 text-2xl font-bold text-brand-plum">
        주문이 완료되었습니다!
      </h1>
      <p className="mt-2 text-gray-500">
        주문 확인 메일이 발송되었습니다.
        <br />
        감사합니다!
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link to="/" className="btn-secondary">
          홈으로
        </Link>
        <Link to="/products" className="btn-primary">
          계속 쇼핑하기
        </Link>
      </div>
    </div>
  );
}
