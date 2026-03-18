import { loadTossPayments } from '@tosspayments/tosspayments-sdk';
import type { CartItem, CheckoutFormData } from '@/types';

const clientKey = import.meta.env.VITE_TOSS_CLIENT_KEY;
const BASE_URL = window.location.origin + import.meta.env.BASE_URL;

/** 토스페이먼츠 결제 요청 */
export async function requestPayment(
  items: CartItem[],
  formData: CheckoutFormData,
  orderId: string,
) {
  if (!clientKey) {
    throw new Error('토스페이먼츠 클라이언트 키가 설정되지 않았습니다.');
  }

  const tossPayments = await loadTossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey: 'ANONYMOUS' });

  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const orderName =
    items.length === 1
      ? items[0].product.name
      : `${items[0].product.name} 외 ${items.length - 1}건`;

  await payment.requestPayment({
    method: 'CARD',
    amount: {
      currency: 'KRW',
      value: totalAmount,
    },
    orderId,
    orderName,
    customerName: formData.customerName,
    customerEmail: formData.customerEmail,
    customerMobilePhone: formData.customerPhone.replace(/-/g, ''),
    successUrl: `${BASE_URL}order/success`,
    failUrl: `${BASE_URL}order/fail`,
  });
}

/** 주문 ID 생성 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `order_${timestamp}_${random}`;
}
