export const RETURN_REASON_OPTIONS = [
  { label: 'خطأ كاشير', value: 'cashier_error' },
  { label: 'خطأ مطبخ', value: 'kitchen_error' },
  { label: 'إلغاء طلب', value: 'order_cancelled' },
  { label: 'عدم رضا العميل', value: 'customer_dissatisfaction' },
  { label: 'منتج تالف', value: 'damaged_product' },
  { label: 'أخرى', value: 'other' },
] as const;

export type ReturnReasonValue = (typeof RETURN_REASON_OPTIONS)[number]['value'];

export function getReturnReasonLabel(value: string | null | undefined, otherText?: string | null): string {
  if (!value) return '-';
  if (value === 'other') return otherText?.trim() || 'أخرى';
  return RETURN_REASON_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

const STORAGE_PREFIX = 'refund-return-reason-';

export function saveReturnReason(refundId: number, reason: string, otherText: string | null) {
  localStorage.setItem(
    `${STORAGE_PREFIX}${refundId}`,
    JSON.stringify({ reason, otherText: otherText ?? '' }),
  );
}

export function loadReturnReason(refundId: number): { reason: string; otherText: string } | null {
  const raw = localStorage.getItem(`${STORAGE_PREFIX}${refundId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
