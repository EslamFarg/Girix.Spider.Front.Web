import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IOrderBillReadResponse } from '@/features/orders';

/**
 * Shared receipt template service.
 * Generates HTML/CSS strings for thermal printer receipts.
 * All templates are RTL, use Cairo font, and are optimized for 80mm thermal paper.
 */
@Injectable({
    providedIn: 'root',
})
export class ReceiptTemplateService {
    private datePipe = new DatePipe('en-US');

    // ─────────────────────────────────────────────
    // Base CSS (shared across all receipt types)
    // ─────────────────────────────────────────────

    private readonly baseCss = `
        body { font-family: 'Cairo', sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 4px; }
    `;

    private readonly thermalWrapperStyle = `
        direction:rtl;
        padding:8px;
        font-family:'Cairo',sans-serif;
        font-size:14px;
        max-width:300px;
    `;

    // ─────────────────────────────────────────────
    // Public API
    // ─────────────────────────────────────────────

    /**
     * Generates a kitchen receipt (simplified, no prices, group name in title).
     * Used for: programPrinter / kitchen tickets.
     * The title includes the group name (e.g. "فاتورة المطبخ - الشواية").
     */
    generateKitchenReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        groupName: string,
    ): { html: string; css: string } {
        const html = this.buildSimplifiedReceiptHtml(bill, items, `فاتورة المطبخ - ${groupName}`);
        return { html, css: this.baseCss };
    }

    /**
     * Generates a captain order receipt (simplified, no prices).
     * Used for: captionOrderPrinter.
     */
    generateCaptainReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
    ): { html: string; css: string } {
        const html = this.buildSimplifiedReceiptHtml(bill, items, 'أمر كابتن');
        return { html, css: this.baseCss };
    }

    /**
     * Generates a full cashier receipt (with prices, customer info, totals).
     * Used for: cashierPrinter.
     */
    generateCashierReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
    ): { html: string; css: string } {
        const itemRows = this.buildItemRowsWithPrices(items);
        const totalUnitPrice = this.calculateTotalUnitPrice(items);

        const html = `
            <div style="${this.thermalWrapperStyle}">
                <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
                    فاتورة كاشير
                </div>
                <div style="margin-bottom:8px;font-size:12px;text-align:center;">
                    <div><strong>رقم الفاتورة:</strong> ${bill.invoiceNo}</div>
                    <div><strong>رقم الطلب:</strong> ${bill.orderNo}</div>
                    <div><strong>التاريخ:</strong> ${this.formatDate(bill.dateTime)}</div>
                    <div><strong>العميل:</strong> ${bill.customer?.name ?? ''}</div>
                    <div><strong>رقم الجوال:</strong> ${bill.customer?.phone ?? ''}</div>
                    <div><strong>نوع الدفع:</strong> ${bill.paymentType ? 'نقدي' : 'آجل'}</div>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #000;">
                            <th style="padding:4px;text-align:right;">الصنف</th>
                            <th style="padding:4px;text-align:center;">الكمية</th>
                            <th style="padding:4px;text-align:left;">السعر</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                        <tr style="border-top:2px solid #000;">
                            <td style="padding:4px;text-align:right;font-weight:bold;">المجموع</td>
                            <td></td>
                            <td style="padding:4px;text-align:left;font-weight:bold;">${totalUnitPrice.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align:center;margin-top:8px;font-size:12px;">
                    <div><strong>الإجمالي:</strong> ${bill.summary?.totalUnitPrice?.toFixed(2) ?? '0.00'}</div>
                    <div><strong>الخصم:</strong> ${bill.summary?.discountAmount?.toFixed(2) ?? '0.00'}</div>
                    <div><strong>الصافي:</strong> ${bill.summary?.totalNet?.toFixed(2) ?? '0.00'}</div>
                </div>
            </div>`;

        return { html, css: this.baseCss };
    }

    // ─────────────────────────────────────────────
    // Private builders
    // ─────────────────────────────────────────────

    /**
     * Builds a simplified receipt (no prices) — used for kitchen and captain.
     */
    private buildSimplifiedReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        title: string,
    ): string {
        const itemRows = this.buildItemRowsWithoutPrices(items);
        const totalQty = this.calculateTotalQty(items);

        return `
            <div style="${this.thermalWrapperStyle}">
                <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
                    ${title}
                </div>
                <div style="margin-bottom:8px;text-align:center;font-size:12px;">
                    <div>رقم الفاتورة ${bill.invoiceNo}</div>
                    <div>${this.formatDate(bill.dateTime)}</div>
                    <div>نوع الطلب: ${this.formatOrderType(bill.orderType)}</div>
                </div>
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:2px solid #000;">
                            <th style="padding:4px;text-align:right;">الصنف</th>
                            <th style="padding:4px;text-align:center;">الكمية</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                        <tr style="border-top:2px solid #000;">
                            <td style="padding:4px;text-align:right;font-weight:bold;">المجموع</td>
                            <td style="padding:4px;text-align:center;font-weight:bold;">${totalQty.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align:center;margin-top:8px;font-size:12px;">
                    رقم الطلب ${bill.orderNo}
                </div>
            </div>`;
    }

    /**
     * Builds item rows WITHOUT prices (for kitchen/captain).
     */
    private buildItemRowsWithoutPrices(items: IOrderBillReadResponse['items']): string {
        return items
            .map((item) => {
                let rows = `
                    <tr>
                        <td style="padding:4px 0;text-align:right;border-bottom:1px dashed #ccc;">${item.name}</td>
                        <td style="padding:4px 0;text-align:center;border-bottom:1px dashed #ccc;">${item.qty}</td>
                    </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
                    <tr>
                        <td style="padding:4px 16px 4px 4px;text-align:right;border-bottom:1px dashed #eee;color:#555;font-size:13px;">+ ${modifier.name}</td>
                        <td style="padding:4px 0;text-align:center;border-bottom:1px dashed #eee;color:#555;font-size:13px;">${modifier.qty}</td>
                    </tr>`;
                }
                return rows;
            })
            .join('');
    }

    /**
     * Builds item rows WITH prices (for cashier).
     */
    private buildItemRowsWithPrices(items: IOrderBillReadResponse['items']): string {
        return items
            .map((item) => {
                let rows = `
                    <tr>
                        <td style="padding:4px;text-align:right;">${item.name}</td>
                        <td style="padding:4px;text-align:center;">${item.qty}</td>
                        <td style="padding:4px;text-align:left;">${item.unitPriceWithTax?.toFixed(2) ?? '0.00'}</td>
                    </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
                    <tr>
                        <td style="padding:4px 16px 4px 4px;text-align:right;color:#555;font-size:12px;">+ ${modifier.name}</td>
                        <td style="padding:4px;text-align:center;color:#555;font-size:12px;">${modifier.qty}</td>
                        <td style="padding:4px;text-align:left;color:#555;font-size:12px;">${modifier.unitPriceWithTax?.toFixed(2) ?? '0.00'}</td>
                    </tr>`;
                }
                return rows;
            })
            .join('');
    }

    /**
     * Calculates total quantity including modifiers.
     */
    private calculateTotalQty(items: IOrderBillReadResponse['items']): number {
        return items.reduce((sum, item) => {
            let qty = item.qty;
            for (const modifier of item.modifiers ?? []) {
                qty += modifier.qty;
            }
            return sum + qty;
        }, 0);
    }

    /**
     * Calculates total unit price including modifiers.
     */
    private calculateTotalUnitPrice(items: IOrderBillReadResponse['items']): number {
        return items.reduce((sum, item) => {
            let itemTotal = (item.unitPriceWithTax ?? 0) * item.qty;
            for (const modifier of item.modifiers ?? []) {
                itemTotal += (modifier.unitPriceWithTax ?? 0) * modifier.qty;
            }
            return sum + itemTotal;
        }, 0);
    }

    /**
     * Formats a date string.
     */
    private formatDate(dateTime: string | Date | null | undefined): string {
        if (!dateTime) return '';
        return this.datePipe.transform(dateTime, 'dd/MM/yyyy h:mm a') ?? '';
    }

    /**
     * Formats order type number to Arabic string.
     */
    private formatOrderType(orderType: number | null | undefined): string {
        if (orderType === 1) return 'سفري';
        if (orderType === 2) return 'محلي';
        if (orderType === 3) return 'توصيل';
        return 'غير معروف';
    }
}
