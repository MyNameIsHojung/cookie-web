-- =============================================
-- 디저트 판매 웹사이트 데이터베이스 스키마
-- =============================================

-- 카테고리 열거형
CREATE TYPE product_category AS ENUM (
  'cake', 'cookie', 'bread', 'tart', 'macaron', 'chocolate', 'other'
);

-- 주문 상태 열거형
CREATE TYPE order_status AS ENUM (
  'pending', 'paid', 'preparing', 'ready', 'completed', 'cancelled', 'refunded'
);

-- =============================================
-- 상품 테이블
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 2000),
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  category product_category NOT NULL DEFAULT 'other',
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_available BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 주문 테이블
-- =============================================
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL CHECK (char_length(customer_name) <= 50),
  customer_email TEXT NOT NULL CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  customer_phone TEXT NOT NULL CHECK (customer_phone ~* '^\d{2,4}-?\d{3,4}-?\d{4}$'),
  customer_address TEXT CHECK (char_length(customer_address) <= 500),
  customer_address_detail TEXT CHECK (char_length(customer_address_detail) <= 200),
  customer_zipcode TEXT CHECK (char_length(customer_zipcode) <= 10),
  delivery_memo TEXT CHECK (char_length(delivery_memo) <= 200),
  total_amount INTEGER NOT NULL CHECK (total_amount >= 0),
  status order_status NOT NULL DEFAULT 'pending',
  payment_key TEXT,
  toss_order_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 주문 상품 테이블
-- =============================================
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- 인덱스
-- =============================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available, sort_order);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- updated_at 자동 갱신 트리거
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 주문번호 생성 함수
-- =============================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 100000)::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- =============================================
-- 재고 차감 함수 (주문 시 호출)
-- =============================================
CREATE OR REPLACE FUNCTION decrease_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock INTO current_stock FROM products WHERE id = p_product_id FOR UPDATE;

  IF current_stock IS NULL THEN
    RAISE EXCEPTION '상품을 찾을 수 없습니다.';
  END IF;

  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;

  UPDATE products SET stock = stock - p_quantity WHERE id = p_product_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 재고 복구 함수 (주문 취소 시 호출)
-- =============================================
CREATE OR REPLACE FUNCTION restore_stock(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE products p
  SET stock = p.stock + oi.quantity
  FROM order_items oi
  WHERE oi.order_id = p_order_id AND oi.product_id = p.id;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 상품: 모든 사용자가 조회 가능, 관리자만 수정 가능
CREATE POLICY "products_select_all" ON products
  FOR SELECT USING (true);

CREATE POLICY "products_insert_admin" ON products
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "products_update_admin" ON products
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "products_delete_admin" ON products
  FOR DELETE USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- 주문: 비인증 사용자도 주문 생성 가능, 관리자만 전체 조회/수정 가능
CREATE POLICY "orders_insert_all" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "orders_update_admin" ON orders
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- 주문 상품: 비인증 사용자도 생성 가능, 관리자만 조회 가능
CREATE POLICY "order_items_insert_all" ON order_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "order_items_select_admin" ON order_items
  FOR SELECT USING (
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

-- =============================================
-- Storage 버킷 (상품 이미지)
-- =============================================
-- 주의: 버킷 생성은 SQL Editor가 아닌 아래 방법 중 하나로 수행하세요.
--
-- [방법 1] Supabase Dashboard
--   Storage > New Bucket > 이름: product-images, Public: ON
--
-- [방법 2] Supabase JS (관리자 코드에서 1회 실행)
--   supabase.storage.createBucket('product-images', { public: true })
--
-- 버킷 생성 후 아래 RLS 정책을 SQL Editor에서 실행하세요:

-- Storage RLS 정책 (버킷 생성 후 실행)
CREATE POLICY "product_images_select_all" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "product_images_insert_admin" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );

CREATE POLICY "product_images_delete_admin" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images' AND
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
  );
