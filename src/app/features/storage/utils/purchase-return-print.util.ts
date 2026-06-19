import { IPurchaseReturnReadResponse } from '../types/api/purchase-return/responses';

/** Shared A4 print body for Purchase Return — used by form and explorer. */
export function buildPurchaseReturnPrintHtml(ret: IPurchaseReturnReadResponse): string {
  const fmt = (s: string) => {
    const d = new Date(s);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const money = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const paymentLabel = ret.paymentType === 1 ? 'نقدي' : 'آجل';

  const itemRows = ret.items
    .map(
      (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.menuItemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.purchasePrice)}</td>
            <td class="num">${money(item.salePrice)}</td>
            <td class="num">${money(item.taxAmount)}</td>
            <td class="num">${money(item.lineTotal)}</td>
          </tr>`,
    )
    .join('');

  const paymentRows =
    ret.paymentType === 1
      ? `
          <div class="total-item"><span class="total-label">نقدي</span><span class="total-value">${money(ret.cashAmount)}</span></div>
          <div class="total-item"><span class="total-label">شبكة</span><span class="total-value">${money(ret.networkAmount)}</span></div>`
      : '';

  return `
          <div class="doc-header">
            <div class="doc-logo">↩</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">مرتجع مشتريات</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field"><span class="meta-label">رقم المرتجع:</span><span class="meta-value">${ret.returnNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">التاريخ:</span><span class="meta-value">${fmt(ret.returnDate)}</span></div>
            <div class="meta-field"><span class="meta-label">رقم فاتورة المشتريات:</span><span class="meta-value">${ret.purchaseInvoiceNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">نوع الدفع:</span><span class="meta-value">${paymentLabel}</span></div>
            <div class="meta-field"><span class="meta-label">الرقم الدفتري:</span><span class="meta-value">${ret.referenceNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">المورد:</span><span class="meta-value">${ret.supplierName ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">رقم الجوال:</span><span class="meta-value">${ret.supplierPhoneNumber ?? '-'}</span></div>
            <div class="meta-field"><span class="meta-label">الرقم الضريبي:</span><span class="meta-value">${ret.supplierTaxNumber ?? '-'}</span></div>
          </div>

          ${ret.reason ? `<div class="statement-banner mb-2"><span class="meta-label">سبب الإرجاع: </span><span>${ret.reason}</span></div>` : ''}

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:28%">المنتج</th>
                <th style="width:8%">الوحدة</th>
                <th style="width:8%">الكمية المرتجعة</th>
                <th style="width:13%">سعر الشراء</th>
                <th style="width:13%">سعر البيع</th>
                <th style="width:10%">الضريبة</th>
                <th style="width:16%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="bold">الإجمالي</td>
                <td class="num bold">${money(ret.taxAmount)}</td>
                <td class="num bold">${money(ret.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            <div class="total-item"><span class="total-label">المبلغ قبل الضريبة</span><span class="total-value">${money(ret.subTotal)}</span></div>
            <div class="total-item"><span class="total-label">إجمالي الضريبة</span><span class="total-value">${money(ret.taxAmount)}</span></div>
            <div class="total-item"><span class="total-label">الإجمالي الكلي</span><span class="total-value">${money(ret.totalAmount)}</span></div>
            ${paymentRows}
          </div>

          <div class="sig-footer">
            <div class="sig-row">
              <div class="sig-box"><span class="sig-title">المُسلِّم</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
              <div class="sig-box"><span class="sig-title">المورد</span><div class="sig-line"></div><span class="sig-name">التوقيع / الختم</span></div>
              <div class="sig-box"><span class="sig-title">المحاسب</span><div class="sig-line"></div><span class="sig-name">التوقيع / الاسم</span></div>
              <div class="sig-box"><span class="sig-title">اعتماد الإدارة</span><div class="sig-line"></div><span class="sig-name">التوقيع / الختم</span></div>
            </div>
          </div>`;
}
