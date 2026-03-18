// 상품 카테고리
export type ProductCategory =
  | 'cake'
  | 'cookie'
  | 'bread'
  | 'tart'
  | 'macaron'
  | 'chocolate'
  | 'other';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cake: '케이크',
  cookie: '쿠키',
  bread: '빵',
  tart: '타르트',
  macaron: '마카롱',
  chocolate: '초콜릿',
  other: '기타',
};

// 주문 상태
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  preparing: '준비 중',
  ready: '준비 완료',
  completed: '완료',
  cancelled: '취소',
  refunded: '환불',
};

// 상품
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: ProductCategory;
  stock: number;
  is_available: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 주문
export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string | null;
  customer_address_detail: string | null;
  customer_zipcode: string | null;
  delivery_memo: string | null;
  total_amount: number;
  status: OrderStatus;
  payment_key: string | null;
  toss_order_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

// 주문 상품
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

// 주문 + 상품 정보
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

// 장바구니 아이템
export interface CartItem {
  product: Product;
  quantity: number;
}

// 주문 폼 데이터
export interface CheckoutFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerAddressDetail: string;
  customerZipcode: string;
  deliveryMemo: string;
}
