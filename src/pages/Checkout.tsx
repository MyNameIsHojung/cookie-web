import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { supabase } from '@/lib/supabase';
import { requestPayment, generateOrderId } from '@/lib/payment';
import { validateCheckoutForm, sanitize, type ValidationErrors } from '@/utils/validation';
import { formatPrice } from '@/utils/format';
import type { CheckoutFormData } from '@/types';

export default function Checkout() {
  const { items, totalPrice } = useCartStore();
  const total = totalPrice();

  const [form, setForm] = useState<CheckoutFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerAddressDetail: '',
    customerZipcode: '',
    deliveryMemo: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev: ValidationErrors) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);

    try {
      const tossOrderId = generateOrderId();

      // 입력값 정화
      const sanitizedForm = {
        customerName: sanitize(form.customerName.trim()),
        customerEmail: sanitize(form.customerEmail.trim()),
        customerPhone: sanitize(form.customerPhone.trim()),
        customerAddress: sanitize(form.customerAddress.trim()),
        customerAddressDetail: sanitize(form.customerAddressDetail.trim()),
        customerZipcode: sanitize(form.customerZipcode.trim()),
        deliveryMemo: sanitize(form.deliveryMemo.trim()),
      };

      // 주문 생성
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: '',
          customer_name: sanitizedForm.customerName,
          customer_email: sanitizedForm.customerEmail,
          customer_phone: sanitizedForm.customerPhone,
          customer_address: sanitizedForm.customerAddress,
          customer_address_detail: sanitizedForm.customerAddressDetail || null,
          customer_zipcode: sanitizedForm.customerZipcode || null,
          delivery_memo: sanitizedForm.deliveryMemo || null,
          total_amount: total,
          toss_order_id: tossOrderId,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 주문 상품 생성
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 재고 차감
      for (const item of items) {
        const { data: result } = await supabase.rpc('decrease_stock', {
          p_product_id: item.product.id,
          p_quantity: item.quantity,
        });
        if (result === false) {
          throw new Error(`${item.product.name}의 재고가 부족합니다.`);
        }
      }

      // 토스페이먼츠 결제 요청
      await requestPayment(items, sanitizedForm, tossOrderId);

      // 결제 위젯이 열리므로 여기서 더 진행되지 않음
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '주문 처리 중 오류가 발생했습니다.';
      alert(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold text-brand-plum">주문하기</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-plum">
                주문자 정보
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이름 *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={form.customerName}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="홍길동"
                    maxLength={50}
                    required
                  />
                  {errors.customerName && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    이메일 *
                  </label>
                  <input
                    type="email"
                    name="customerEmail"
                    value={form.customerEmail}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="example@email.com"
                    required
                  />
                  {errors.customerEmail && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    전화번호 *
                  </label>
                  <input
                    type="tel"
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="010-1234-5678"
                    required
                  />
                  {errors.customerPhone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    주소 *
                  </label>
                  <input
                    type="text"
                    name="customerAddress"
                    value={form.customerAddress}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="서울시 강남구 역삼동 123"
                    maxLength={500}
                    required
                  />
                  {errors.customerAddress && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customerAddress}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    상세주소
                  </label>
                  <input
                    type="text"
                    name="customerAddressDetail"
                    value={form.customerAddressDetail}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="101동 1001호"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    우편번호
                  </label>
                  <input
                    type="text"
                    name="customerZipcode"
                    value={form.customerZipcode}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="06000"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    배송 메모
                  </label>
                  <textarea
                    name="deliveryMemo"
                    value={form.deliveryMemo}
                    onChange={handleChange}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="배송 시 요청사항을 입력해주세요."
                    maxLength={200}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-24 rounded-xl border border-gray-100 bg-gray-50 p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-bold text-brand-plum">
                주문 요약
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600">
                      {item.product.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">총 결제금액</span>
                  <span className="text-xl font-bold text-brand-plum">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-6 w-full"
              >
                {submitting ? '처리 중...' : `${formatPrice(total)} 결제하기`}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
