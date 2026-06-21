import { getReturnReasonLabel } from '../constants/return-reason.constants';

export interface IRefundPrintLine {
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  isAddon?: boolean;
}

export interface IRefundPrintData {
  returnNumber: string | number;
  originalInvoiceNumber: string | number;
  customerName: string;
  date: string;
  userName: string;
  returnReason: string;
  orderTypeLabel: string;
  paymentMethodLabel: string;
  payingCash: number;
  payingNetwork: number;
  total: number;
  lines: IRefundPrintLine[];
}

export function buildSalesReturnPrintHtml(data: IRefundPrintData): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const money = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const itemRows = data.lines
    .map(
      (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.isAddon ? `↳ ${item.name}` : item.name}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.unitPrice)}</td>
            <td class="num">${money(item.lineTotal)}</td>
          </tr>`,
    )
    .join('');

  const paymentRows =
    data.payingCash > 0 || data.payingNetwork > 0
      ? `
          <div class="total-item"><span class="total-label">استرداد نقدي</span><span class="total-value">${money(data.payingCash)}</span></div>
          <div class="total-item"><span class="total-label">استرداد شبكة</span><span class="total-value">${money(data.payingNetwork)}</span></div>`
      : `<div class="total-item"><span class="total-label">نوع الاسترداد</span><span class="total-value">${data.paymentMethodLabel}</span></div>`;

  return `
          <div class="doc-header">
            <div class="doc-logo">↩</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">مرتجع مبيعات</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field"><span class="meta-label">رقم المرتجع:</span><span class="meta-value">${data.returnNumber}</span></div>
            <div class="meta-field"><span class="meta-label">رقم الفاتورة الأصلية:</span><span class="meta-value">${data.originalInvoiceNumber}</span></div>
            <div class="meta-field"><span class="meta-label">التاريخ:</span><span class="meta-value">${fmt(data.date)}</span></div>
            <div class="meta-field"><span class="meta-label">العميل:</span><span class="meta-value">${data.customerName || '-'}</span></div>
            <div class="meta-field"><span class="meta-label">نوع الطلب:</span><span class="meta-value">${data.orderTypeLabel}</span></div>
            <div class="meta-field"><span class="meta-label">المستخدم:</span><span class="meta-value">${data.userName || '-'}</span></div>
            <div class="meta-field"><span class="meta-label">طريقة الدفع:</span><span class="meta-value">${data.paymentMethodLabel}</span></div>
          </div>

          <div class="statement-banner mb-2">
            <span class="meta-label">سبب المرتجع: </span><span>${data.returnReason || '-'}</span>
          </div>

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:5%">#</th>
                <th style="width:45%">الصنف</th>
                <th style="width:15%">الكمية</th>
                <th style="width:17%">السعر</th>
                <th style="width:18%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="4" class="bold">إجمالي المرتجع</td>
                <td class="num bold">${money(data.total)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            ${paymentRows}
            <div class="total-item"><span class="total-label">الإجمالي</span><span class="total-value">${money(data.total)}</span></div>
          </div>

          <div class="sig-footer">
            <div class="sig-row">
              <div class="sig-box"><span class="sig-title">الكاشير</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
              <div class="sig-box"><span class="sig-title">العميل</span><div class="sig-line"></div><span class="sig-name">التوقيع</span></div>
              <div class="sig-box"><span class="sig-title">المحاسب</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
            </div>
          </div>`;
}

export function getPaymentMethodLabel(payingCash: number, payingNetwork: number, isPaid: boolean): string {
  if (!isPaid) return 'فاتورة آجلة';
  if (payingCash > 0 && payingNetwork > 0) return 'كاش / شبكة';
  if (payingCash > 0) return 'كاش';
  if (payingNetwork > 0) return 'شبكة';
  return '-';
}
