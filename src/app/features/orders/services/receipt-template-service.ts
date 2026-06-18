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
        body { font-family: 'Cairo', sans-serif; font-size: 22px; }
        table { border-collapse: collapse; width: 100%; font-size: 22px; }
        th, td { padding: 6px; font-size: 22px; }
        div, span, p, strong, b, label { font-size: 22px; }
    `;

    private readonly thermalWrapperStyle = `
        direction:rtl;
        padding:4px;
        font-family:'Cairo',sans-serif;
        font-size:22px;
        width:100%;
        box-sizing:border-box;
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
        restaurantName: string = 'فاتورة',
    ): { html: string; css: string } {
        const html = this.buildSimplifiedReceiptHtml(bill, items, `${restaurantName} - ${groupName}`);
        return { html, css: this.baseCss };
    }

    /**
     * Generates a captain order receipt (simplified, no prices).
     * Used for: captionOrderPrinter.
     */
    generateCaptainReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        restaurantName: string = 'أمر كابتن',
    ): { html: string; css: string } {
        const html = this.buildSimplifiedReceiptHtml(bill, items, restaurantName);
        return { html, css: this.baseCss };
    }

    /**
     * Generates a full cashier receipt (with prices, customer info, totals).
     * Used for: cashierPrinter.
     */
    generateCashierReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        restaurantName: string = 'فاتورة كاشير',
    ): { html: string; css: string } {
        const itemRows = this.buildItemRowsWithPrices(items);

        const html = `
            <div style="${this.thermalWrapperStyle}">
                <!-- Header -->
                <div style="text-align:center;margin-bottom:12px;font-weight:bold;font-size:26px;border-bottom:3px solid #000;padding-bottom:10px;">
                    ${restaurantName}
                </div>

                <!-- Bill Info -->
                <div style="margin-bottom:12px;">
                    ${this.infoRow('رقم الفاتورة:', bill.invoiceNo)}
                    ${this.infoRow('رقم الطلب:', bill.orderNo)}
                    ${this.infoRow('التاريخ:', this.formatDate(bill.dateTime))}
                    ${this.infoRow('نوع الطلب:', this.formatOrderType(bill.orderType))}
                    ${this.infoRow('نوع الدفع:', bill.paymentType ? 'نقدي' : 'آجل')}
                    ${bill.place?.placeName ? this.infoRow('المكان:', bill.place.placeName) : ''}
                    ${bill.place?.durationMinutes ? this.infoRow('مدة الحجز:', bill.place.durationMinutes + ' دقيقة') : ''}
                    ${bill.place?.reservedFrom && bill.place?.reservedTo ? this.infoRow('وقت الحجز:', this.formatDate(bill.place.reservedFrom) + ' - ' + this.formatTime(bill.place.reservedTo)) : ''}
                </div>

                <!-- Divider -->
                <div style="border-top:2px dashed #000;margin:10px 0;"></div>

                <!-- Customer Info -->
                <div style="margin-bottom:12px;">
                    <div style="text-align:center;font-weight:bold;margin-bottom:8px;font-size:24px;border-bottom:1px solid #ccc;padding-bottom:4px;">معلومات العميل</div>
                    ${this.infoRow('العميل:', bill.customer?.name ?? 'عميل نقدي')}
                    ${bill.customer?.phone ? this.infoRow('رقم الجوال:', bill.customer.phone) : ''}
                    ${bill.customer?.address ? this.infoRow('العنوان:', bill.customer.address) : ''}
                </div>

                <!-- Divider -->
                <div style="border-top:2px dashed #000;margin:10px 0;"></div>

                <!-- Items Table -->
                <table style="width:100%;border-collapse:collapse;margin-bottom:10px;table-layout:fixed;">
                    <colgroup>
                        <col style="width:160px;">
                        <col style="width:50px;">
                        <col style="width:64px;">
                        <col style="width:64px;">
                    </colgroup>
                    <thead>
                        <tr style="border-bottom:2px solid #000;">
                            <th style="padding:4px 2px;text-align:right;font-size:18px;">الصنف</th>
                            <th style="padding:4px 2px;text-align:center;font-size:18px;">الكمية</th>
                            <th style="padding:4px 2px;text-align:center;font-size:18px;">السعر</th>
                            <th style="padding:4px 2px;text-align:left;font-size:18px;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                    </tbody>
                </table>

                <!-- Divider -->
                <div style="border-top:2px dashed #000;margin:10px 0;"></div>

                <!-- Totals -->
                <div style="margin-bottom:12px;">
                    <div style="text-align:center;font-weight:bold;margin-bottom:8px;font-size:24px;border-bottom:1px solid #ccc;padding-bottom:4px;">الملخص</div>
                    ${this.infoRow('الإجمالي:', (bill.summary?.totalUnitPrice ?? 0).toFixed(2))}
                    ${this.infoRow('الخصم:', (bill.summary?.discountAmount ?? 0).toFixed(2))}
                    ${this.infoRow('نسبة الخصم:', (bill.summary?.discountPercentage ?? 0).toFixed(2) + '%')}
                    ${this.infoRow('رسوم الخدمة:', (bill.summary?.serviceFee ?? 0).toFixed(2))}
                    ${this.infoRow('ضريبة الخدمة:', (bill.summary?.systemServiceFee ?? 0).toFixed(2))}
                    ${this.infoRow('ضريبة القيمة المضافة:', (bill.summary?.vatAmount ?? 0).toFixed(2))}
                    ${this.infoRow('الضريبة الانتقائية:', (bill.summary?.totalSelectiveTax ?? 0).toFixed(2))}
                    ${this.infoRow('سعر المكان:', (bill.summary?.priceForPlace ?? 0).toFixed(2))}
                    ${this.infoRow('مدة الحجز:', (bill.summary?.durationMinutes ?? 0) + ' دقيقة')}
                    <div style="display:flex;justify-content:space-between;margin-top:8px;border-top:3px solid #000;padding-top:8px;">
                        <span style="font-size:26px;font-weight:bold;">الصافي:</span>
                        <span style="font-size:26px;font-weight:bold;">${(bill.summary?.totalNet ?? 0).toFixed(2)}</span>
                    </div>
                </div>

                <!-- Payment Details -->
                ${bill.payments?.payingCash || bill.payments?.payingNetwork ? `
                <div style="border-top:2px dashed #000;margin:10px 0;"></div>
                <div style="margin-bottom:12px;">
                    <div style="text-align:center;font-weight:bold;margin-bottom:8px;font-size:24px;border-bottom:1px solid #ccc;padding-bottom:4px;">تفاصيل الدفع</div>
                    ${this.infoRow('نقدي:', (bill.payments?.payingCash ?? 0).toFixed(2))}
                    ${this.infoRow('شبكة:', (bill.payments?.payingNetwork ?? 0).toFixed(2))}
                    ${this.infoRow('المتبقي:', (bill.payments?.remaining ?? 0).toFixed(2))}
                </div>` : ''}

                <!-- To Be Paid -->
                ${bill.toBePaid ? `
                <div style="border-top:2px dashed #000;margin:10px 0;"></div>
                <div style="margin-bottom:12px;">
                    <div style="text-align:center;font-weight:bold;margin-bottom:8px;font-size:24px;border-bottom:1px solid #ccc;padding-bottom:4px;">المطلوب سداده</div>
                    ${this.infoRow('قبل الطلب:', (bill.toBePaid?.beforeNetOrder ?? 0).toFixed(2))}
                    ${this.infoRow('بعد الطلب:', (bill.toBePaid?.afterNetOrder ?? 0).toFixed(2))}
                    ${this.infoRow('المبلغ:', (bill.toBePaid?.amount ?? 0).toFixed(2))}
                </div>` : ''}

                <!-- Footer -->
                <div style="border-top:3px solid #000;margin-top:12px;padding-top:10px;text-align:center;">
                    <div style="margin-bottom:6px;font-size:24px;font-weight:bold;">شكراً لزيارتكم</div>
                </div>
            </div>`;

        return { html, css: this.baseCss };
    }

    // ─────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────

    private infoRow(label: string, value: string | number): string {
        return `
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                <span><strong>${label}</strong></span>
                <span>${value}</span>
            </div>`;
    }

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
                <div style="text-align:center;margin-bottom:10px;font-weight:bold;font-size:24px;">
                    ${title}
                </div>
                <div style="margin-bottom:10px;text-align:center;font-size:20px;">
                    <div>رقم الفاتورة ${bill.invoiceNo}</div>
                    <div>${this.formatDate(bill.dateTime)}</div>
                    <div>نوع الطلب: ${this.formatOrderType(bill.orderType)}</div>
                    ${bill.place?.placeName ? `<div>المكان: ${bill.place.placeName}</div>` : ''}
                </div>
                <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
                    <colgroup>
                        <col style="width:260px;">
                        <col style="width:78px;">
                    </colgroup>
                    <thead>
                        <tr style="border-bottom:2px solid #000;">
                            <th style="padding:4px 2px;text-align:right;font-size:18px;">الصنف</th>
                            <th style="padding:4px 2px;text-align:center;font-size:18px;">الكمية</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemRows}
                        <tr style="border-top:2px solid #000;">
                            <td style="padding:4px 2px;text-align:right;font-weight:bold;font-size:18px;">المجموع</td>
                            <td style="padding:4px 2px;text-align:center;font-weight:bold;font-size:18px;">${totalQty.toFixed(2)}</td>
                        </tr>
                    </tbody>
                </table>
                <div style="text-align:center;margin-top:10px;font-size:20px;">
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
                        <td style="padding:4px 2px;text-align:right;border-bottom:1px dashed #ccc;font-size:18px;word-break:break-all;">${this.formatItemName(item.name, 22)}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #ccc;font-size:18px;white-space:nowrap;">${item.qty}</td>
                    </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
                    <tr>
                        <td style="padding:4px 2px 4px 8px;text-align:right;border-bottom:1px dashed #eee;color:#555;font-size:16px;word-break:break-all;">+ ${this.formatItemName(modifier.name, 22)}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #eee;color:#555;font-size:16px;white-space:nowrap;">${modifier.qty}</td>
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
                const itemTotal = (item.unitPriceWithTax ?? 0) * item.qty;
                let rows = `
                    <tr>
                        <td style="padding:4px 2px;text-align:right;border-bottom:1px dashed #ccc;font-size:18px;word-break:break-all;">${this.formatItemName(item.name, 14)}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #ccc;font-size:18px;white-space:nowrap;">${item.qty}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #ccc;font-size:18px;white-space:nowrap;">${item.unitPriceWithTax?.toFixed(2) ?? '0.00'}</td>
                        <td style="padding:4px 2px;text-align:left;border-bottom:1px dashed #ccc;font-size:18px;white-space:nowrap;">${itemTotal.toFixed(2)}</td>
                    </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    const modTotal = (modifier.unitPriceWithTax ?? 0) * modifier.qty;
                    rows += `
                    <tr>
                        <td style="padding:4px 2px 4px 8px;text-align:right;border-bottom:1px dashed #eee;color:#555;font-size:16px;word-break:break-all;">+ ${this.formatItemName(modifier.name, 14)}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #eee;color:#555;font-size:16px;white-space:nowrap;">${modifier.qty}</td>
                        <td style="padding:4px 2px;text-align:center;border-bottom:1px dashed #eee;color:#555;font-size:16px;white-space:nowrap;">${modifier.unitPriceWithTax?.toFixed(2) ?? '0.00'}</td>
                        <td style="padding:4px 2px;text-align:left;border-bottom:1px dashed #eee;color:#555;font-size:16px;white-space:nowrap;">${modTotal.toFixed(2)}</td>
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

    private formatItemName(name: string, maxLen: number = 14): string {
        if (name.length <= maxLen) return name;
        return name.substring(0, maxLen) + '..';
    }
    private formatDate(dateTime: string | Date | null | undefined): string {
        if (!dateTime) return '';
        return this.datePipe.transform(dateTime, 'dd/MM/yyyy h:mm a') ?? '';
    }

    /**
     * Formats a time string.
     */
    private formatTime(dateTime: string | Date | null | undefined): string {
        if (!dateTime) return '';
        return this.datePipe.transform(dateTime, 'h:mm a') ?? '';
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
