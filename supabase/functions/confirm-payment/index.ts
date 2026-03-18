// Supabase Edge Function: 토스페이먼츠 결제 검증
// 배포: supabase functions deploy confirm-payment --no-verify-jwt

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const TOSS_SECRET_KEY = Deno.env.get('TOSS_SECRET_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, paymentKey, amount } = await req.json();

    // 입력 검증
    if (!orderId || !paymentKey || !amount || typeof amount !== 'number') {
      return new Response(
        JSON.stringify({ success: false, message: '잘못된 요청입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Supabase 서비스 클라이언트 (RLS 우회)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 주문 정보 조회 및 금액 검증
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('toss_order_id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, message: '주문을 찾을 수 없습니다.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 금액 위변조 검증
    if (order.total_amount !== amount) {
      return new Response(
        JSON.stringify({ success: false, message: '결제 금액이 일치하지 않습니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 토스페이먼츠 결제 승인 API 호출
    const encryptedSecretKey = btoa(`${TOSS_SECRET_KEY}:`);

    const tossResponse = await fetch(
      'https://api.tosspayments.com/v1/payments/confirm',
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${encryptedSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, paymentKey, amount }),
      },
    );

    const tossData = await tossResponse.json();

    if (!tossResponse.ok) {
      // 결제 실패 시 주문 상태를 cancelled로 변경
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', order.id);

      // 재고 복구
      await supabase.rpc('restore_stock', { p_order_id: order.id });

      return new Response(
        JSON.stringify({
          success: false,
          message: tossData.message || '결제 승인에 실패했습니다.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // 결제 성공: 주문 상태 업데이트
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_key: paymentKey,
        paid_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    return new Response(
      JSON.stringify({ success: true, orderNumber: order.order_number }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: '서버 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
