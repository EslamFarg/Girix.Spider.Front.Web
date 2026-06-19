import { IOpeningBalanceReadResponse } from '../types/api/opening-balances/responses';

/** Shared A4 print body for Opening Balance — used by form and explorer. */
export function buildOpeningBalancePrintHtml(invoice: IOpeningBalanceReadResponse): string {
  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    const dd = d.getDate().toString().padStart(2, '0');
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };
  const money = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const itemRows = invoice.items
    .map(
      (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.itemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${money(item.quantity)}</td>
            <td class="num">${money(item.salePrice)}</td>
            <td class="num">${money(item.purchasePrice)}</td>
            <td class="num">${money(item.total)}</td>
          </tr>`,
    )
    .join('');

  return `
          <div class="doc-header">
            <div class="doc-logo">📦</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">رصيد افتتاحي</div>
          </div>

          <div class="meta-grid">
            <div class="meta-field">
              <span class="meta-label">رقم الفاتورة:</span>
              <span class="meta-value">${invoice.invoiceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">التاريخ:</span>
              <span class="meta-value">${fmt(invoice.date)}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الدفتري:</span>
              <span class="meta-value">${invoice.referenceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">عدد الأصناف:</span>
              <span class="meta-value">${invoice.items.length}</span>
            </div>
          </div>

          ${
            invoice.notes
              ? `
          <div class="statement-banner mb-2">
            <span class="meta-label">البيان: </span>
            <span>${invoice.notes}</span>
          </div>`
              : ''
          }

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:26%">المنتج</th>
                <th style="width:10%">الوحدة</th>
                <th style="width:10%">الكمية</th>
                <th style="width:14%">سعر البيع</th>
                <th style="width:14%">سعر الشراء</th>
                <th style="width:22%">المجموع</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="6" class="bold">الإجمالي</td>
                <td class="num bold">${money(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="totals-box">
            <div class="total-item">
              <span class="total-label">إجمالي الكمية</span>
              <span class="total-value">${money(invoice.items.reduce((s, x) => s + x.quantity, 0))}</span>
            </div>
            <div class="total-item">
              <span class="total-label">إجمالي القيمة</span>
              <span class="total-value">${money(invoice.totalAmount)}</span>
            </div>
          </div>`;
}
