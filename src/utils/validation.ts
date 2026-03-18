import DOMPurify from 'dompurify';

/** XSS 방지를 위한 문자열 정화 */
export function sanitize(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/** 이메일 검증 */
export function isValidEmail(email: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);
}

/** 전화번호 검증 */
export function isValidPhone(phone: string): boolean {
  return /^\d{2,4}-?\d{3,4}-?\d{4}$/.test(phone);
}

/** 이름 검증 (2~50자) */
export function isValidName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}

/** 주문 폼 검증 */
export interface ValidationErrors {
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
}

export function validateCheckoutForm(data: {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
}): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!isValidName(data.customerName)) {
    errors.customerName = '이름을 2자 이상 입력해주세요.';
  }
  if (!isValidEmail(data.customerEmail)) {
    errors.customerEmail = '올바른 이메일 주소를 입력해주세요.';
  }
  if (!isValidPhone(data.customerPhone)) {
    errors.customerPhone = '올바른 전화번호를 입력해주세요.';
  }
  if (!data.customerAddress.trim()) {
    errors.customerAddress = '주소를 입력해주세요.';
  }

  return errors;
}
