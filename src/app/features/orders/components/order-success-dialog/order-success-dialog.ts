import { Component, computed, inject, input, output } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';
import { KeyValuePipe } from '@angular/common';
import { PrinterService } from '@/features/printers';
import { IPrinterSearchRow } from '@/features/printers/types/printer-api';

interface IOrderSuccessItem {
  id: number;
  menuItemId: number;
  mealId: any;
  name: string;
  qty: number;
  returnedQty: number;
  remainingQty: number;
  unitPrice: number;
  selectiveTax: number;
  netUnitPrice: number;
  unitPriceWithTax: number;
  netUnitPriceWithTax: number;
  printer: IPrinterSearchRow;
  modifiers: any[];
}

interface IOrderSuccessResponse {
  id: number;
  invoiceNo: string;
  orderNo: string;
  paymentType: number;
  dateTime: string;
  orderType: number;
  customer: {
    id: number;
    name: string;
    phone: string | null;
    extraPhone: string | null;
    email: string | null;
    address: string | null;
  };
  place: any;
  placeTransactions: any[];
  orderLogs: any[];
  items: IOrderSuccessItem[];
  summary: {
    totalUnitPrice: number;
    discountAmount: number;
    discountPercentage: number;
    serviceFeeType: number;
    systemServiceFee: number;
    systemVat: number;
    totalSelectiveTax: number;
    vatAmount: number;
    serviceFee: number;
    priceForPlace: number;
    durationMinutes: number;
    totalNet: number;
    netReturnOrder: number;
  };
  payments: {
    payingCash: number;
    payingNetwork: number;
    remaining: number;
  };
  toBePaid: {
    beforeNetOrder: number;
    afterNetOrder: number;
    amount: number;
  };
  settingResponse: {
    nameAr: string;
    nameEn: string;
    phoneNumber: string;
    postalCode: string;
    vatNumber: string;
    commercialRegNo: string;
    city: string;
    district: string;
    buildingNumber: string;
    logoUrl: string;
  };
}

interface IPrintJob {
  printer: IPrinterSearchRow;
  html: string;
  css: string;
}

@Component({
  selector: 'app-order-success-dialog',
  imports: [Dialog, ButtonDirective, KeyValuePipe],
  templateUrl: './order-success-dialog.html',
  styleUrl: './order-success-dialog.css',
})
export class OrderSuccessDialog {
  printerService = inject(PrinterService);
  visible = input<boolean>(false);
  order = input<IOrderSuccessResponse | null>(null);
  hide = output<void>();

  itemsByPrinter = computed(() => {
    const order = this.order();
    if (!order) return new Map<number, { printer: IPrinterSearchRow; items: any[] }>();

    const map = new Map<number, { printer: IPrinterSearchRow; items: any[] }>();
    for (const item of (order as any).items ?? []) {
      const printerId = item.printer?.id;
      if (!printerId) continue;

      if (!map.has(printerId)) {
        map.set(printerId, { printer: item.printer, items: [] });
      }
      map.get(printerId)!.items.push(item);
    }
    return map;
  });

  onHide() {
    this.hide.emit();
  }

  onPrint() {
    const order = this.order();
    if (!order) return;

    const jobs: IPrintJob[] = [];
    const styles = this.getReceiptStyles();

    for (const [, group] of this.itemsByPrinter()) {
      const receiptHtml = this.generateReceiptHtml(order, group.items);
      jobs.push({
        printer: group.printer,
        html: receiptHtml,
        css: styles,
      });
    }

    // Also print cashier receipt (all items)
    const cashierReceipt = this.generateReceiptHtml(order, order.items);
    // Use the first printer as cashier printer for now, or we could add a dedicated cashier printer
    const firstPrinter = order.items[0]?.printer;
    if (firstPrinter) {
      jobs.push({
        printer: firstPrinter,
        html: cashierReceipt,
        css: styles,
      });
    }

    this.printerService.printJobs(jobs);
  }

  private getReceiptStyles(): string {
    return `
      .receipt {
        direction: rtl;
        font-family: Arial, sans-serif;
        font-size: 14px;
        padding: 8px;
        max-width: 300px;
      }
      .receipt-header {
        text-align: center;
        border-bottom: 1px dashed #000;
        padding-bottom: 8px;
        margin-bottom: 8px;
      }
      .receipt-header h2 {
        margin: 0;
        font-size: 18px;
      }
      .receipt-info {
        margin-bottom: 8px;
      }
      .receipt-info div {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }
      .receipt-items {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
      }
      .receipt-items th,
      .receipt-items td {
        text-align: right;
        padding: 4px;
        border-bottom: 1px solid #ddd;
      }
      .receipt-items td:nth-child(2),
      .receipt-items td:nth-child(3) {
        text-align: center;
      }
      .receipt-summary {
        border-top: 1px dashed #000;
        padding-top: 8px;
        margin-top: 8px;
      }
      .receipt-summary div {
        display: flex;
        justify-content: space-between;
        margin: 4px 0;
      }
      .receipt-summary .total {
        font-weight: bold;
        font-size: 16px;
        border-top: 1px solid #000;
        padding-top: 4px;
        margin-top: 4px;
      }
      .receipt-footer {
        text-align: center;
        margin-top: 16px;
        font-size: 12px;
      }
    `;
  }

  private generateReceiptHtml(order: IOrderSuccessResponse, items: any[]): string {
    const setting = (order as any).settingResponse;
    const summary = (order as any).summary;

    const itemsRows = items
      .map(
        (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.qty}</td>
          <td>${item.unitPriceWithTax?.toFixed(2) ?? item.unitPrice?.toFixed(2) ?? '0.00'}</td>
        </tr>
      `,
      )
      .join('');

    return `
      <div class="receipt">
        <div class="receipt-header">
          <h2>${setting?.nameAr ?? 'فاتورة'}</h2>
          <div>${setting?.nameEn ?? ''}</div>
          <div>الفاتورة: ${order.invoiceNo ?? order.orderNo ?? ''}</div>
          <div>التاريخ: ${new Date(order.dateTime).toLocaleString('ar-SA')}</div>
        </div>
        
        <div class="receipt-info">
          <div><span>العميل:</span><span>${order.customer?.name ?? 'عميل نقدي'}</span></div>
          <div><span>الهاتف:</span><span>${order.customer?.phone ?? '-'}</span></div>
        </div>

        <table class="receipt-items">
          <thead>
            <tr>
              <th>الصنف</th>
              <th>الكمية</th>
              <th>السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="receipt-summary">
          <div><span>المجموع:</span><span>${summary?.totalUnitPrice?.toFixed(2) ?? '0.00'}</span></div>
          <div><span>الخصم:</span><span>${summary?.discountAmount?.toFixed(2) ?? '0.00'}</span></div>
          <div><span>الضريبة:</span><span>${summary?.vatAmount?.toFixed(2) ?? '0.00'}</span></div>
          <div class="total"><span>الإجمالي:</span><span>${summary?.totalNet?.toFixed(2) ?? '0.00'}</span></div>
        </div>

        <div class="receipt-footer">
          <div>شكراً لزيارتكم</div>
          ${setting?.vatNumber ? `<div>الرقم الضريبي: ${setting.vatNumber}</div>` : ''}
        </div>
      </div>
    `;
  }
}
