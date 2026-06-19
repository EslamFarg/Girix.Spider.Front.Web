import { IPurchaseReadResponse } from '../types/api/purchases/responses';

/** Shared A4 print body for Purchase Invoice — used by form and explorer. */
export function buildPurchasePrintHtml(invoice: IPurchaseReadResponse): string {
  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };
  const money = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const paymentLabel = invoice.paymentType === 1 ? 'نقدي' : 'آجل';

  const itemRows = invoice.items
    .map(
      (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.menuItemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${item.quantity}</td>
            <td class="num">${money(item.purchasePrice)}</td>
            <td class="num">${money(item.taxAmount)}</td>
            <td class="num">${money(item.lineTotal)}</td>
          </tr>`,
    )
    .join('');

  const paymentRows =
    invoice.paymentType === 1
      ? `
          <div class="total-item">
            <span class="total-label">نقدي</span>
            <span class="total-value">${money(invoice.cashAmount)}</span>
          </div>
          <div class="total-item">
            <span class="total-label">شبكة</span>
            <span class="total-value">${money(invoice.networkAmount)}</span>
          </div>`
      : '';

  return `
          <div class="doc-header">
            <div class="doc-logo">🛒</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">فاتورة شراء</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field">
              <span class="meta-label">رقم الفاتورة:</span>
              <span class="meta-value">${invoice.invoiceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">التاريخ:</span>
              <span class="meta-value">${fmt(invoice.invoiceDate)}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">نوع الدفع:</span>
              <span class="meta-value">${paymentLabel}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الدفتري:</span>
              <span class="meta-value">${invoice.referenceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">المورد:</span>
              <span class="meta-value">${invoice.supplierName ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">رقم الجوال:</span>
              <span class="meta-value">${invoice.supplierPhoneNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الضريبي:</span>
              <span class="meta-value">${invoice.supplierTaxNumber ?? '-'}</span>
            </div>
          </div>

          ${
            invoice.statement
              ? `
          <div class="statement-banner mb-2">
            <span class="meta-label">البيان: </span>
            <span>${invoice.statement}</span>
          </div>`
              : ''
          }

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:30%">المنتج</th>
                <th style="width:10%">الوحدة</th>
                <th style="width:10%">الكمية</th>
                <th style="width:14%">سعر الشراء</th>
                <th style="width:12%">الضريبة</th>
                <th style="width:20%">الإجمالي</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="5" class="bold">الإجمالي</td>
                <td class="num bold">${money(invoice.taxAmount)}</td>
                <td class="num bold">${money(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            <div class="total-item">
              <span class="total-label">المبلغ قبل الضريبة</span>
              <span class="total-value">${money(invoice.subTotal)}</span>
            </div>
            <div class="total-item">
              <span class="total-label">إجمالي الضريبة</span>
              <span class="total-value">${money(invoice.taxAmount)}</span>
            </div>
            <div class="total-item">
              <span class="total-label">الإجمالي الكلي</span>
              <span class="total-value">${money(invoice.totalAmount)}</span>
            </div>
            ${paymentRows}
          </div>

          <div class="sig-footer">
            <div class="sig-row">
              <div class="sig-box">
                <span class="sig-title">المستلم</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الاسم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">المورد</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الختم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">المحاسب</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الاسم</span>
              </div>
              <div class="sig-box">
                <span class="sig-title">اعتماد الإدارة</span>
                <div class="sig-line"></div>
                <span class="sig-name">التوقيع / الختم</span>
              </div>
            </div>
          </div>`;
}
