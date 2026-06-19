import { IInventoryReadResponse } from '../types/api/inventory/responses';

/** Shared A4 print body for Inventory Settlement — used by explorer (and form when added). */
export function buildInventorySettlementPrintHtml(settlement: IInventoryReadResponse): string {
  const fmt = (dateStr: string) => {
    const d = new Date(dateStr);
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    const hh = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    return `${yyyy}/${mm}/${dd} ${hh}:${min}`;
  };
  const qty = (v: number) => (+v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const itemRows = settlement.items
    .map(
      (item, i) => `
          <tr>
            <td class="num">${i + 1}</td>
            <td>${item.itemName ?? '-'}</td>
            <td class="num">${item.unitName ?? '-'}</td>
            <td class="num">${qty(item.systemQuantity)}</td>
            <td class="num">${qty(item.actualQuantity)}</td>
            <td class="num">${qty(item.differenceQuantity)}</td>
          </tr>`,
    )
    .join('');

  const totalSystem = settlement.items.reduce((s, x) => s + x.systemQuantity, 0);
  const totalActual = settlement.items.reduce((s, x) => s + x.actualQuantity, 0);
  const totalDiff = settlement.items.reduce((s, x) => s + x.differenceQuantity, 0);

  return `
          <div class="doc-header">
            <div class="doc-logo">📋</div>
            <div class="doc-company">
              <div class="doc-company-name">Rest House</div>
              <div class="doc-company-sub">نظام إدارة المطاعم والحسابات</div>
            </div>
            <div class="doc-title-box">تسوية جردية</div>
          </div>

          <div class="meta-grid cols-3">
            <div class="meta-field">
              <span class="meta-label">رقم التسوية:</span>
              <span class="meta-value">${settlement.settlementNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">التاريخ:</span>
              <span class="meta-value">${fmt(settlement.settlementDate)}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">الرقم الدفتري:</span>
              <span class="meta-value">${settlement.referenceNumber ?? '-'}</span>
            </div>
            <div class="meta-field">
              <span class="meta-label">عدد الأصناف:</span>
              <span class="meta-value">${settlement.items.length}</span>
            </div>
          </div>

          <table class="lines-table">
            <thead>
              <tr>
                <th style="width:4%">#</th>
                <th style="width:34%">المنتج</th>
                <th style="width:14%">الوحدة</th>
                <th style="width:16%">الكمية الدفترية</th>
                <th style="width:16%">الكمية الفعلية</th>
                <th style="width:16%">الفرق</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="3" class="bold">الإجمالي</td>
                <td class="num bold">${qty(totalSystem)}</td>
                <td class="num bold">${qty(totalActual)}</td>
                <td class="num bold">${qty(totalDiff)}</td>
              </tr>
            </tfoot>
          </table>`;
}
