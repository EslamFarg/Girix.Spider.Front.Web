import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import {
    IOrderBillReadResponse,
    IOrderSearchRow,
    OrderPaymentType,
    OrderSearchEnum,
    OrderService,
} from '@/features/orders';
import { DatePipe } from '@angular/common';
import { Menu } from 'primeng/menu';
import { Button, ButtonDirective } from 'primeng/button';
import { Debounce } from '@/directives/debounce';
import { PrinterService, IPrintOrderOption, AppPrinterType } from '@/features/printers';
import { RouterLink } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { FormControlNotifier } from '@/directives/form-control-notifier';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ListboxModule } from 'primeng/listbox';

@Component({
    selector: 'app-orders',
    imports: [
        ReactiveFormsModule,
        InputErrorMessageHandler,
        InputGroupAddon,
        InputTextModule,
        SelectModule,
        PaginatorModule,
        SectionWrapper,
        DatePipe,
        Menu,
        Button,
        Debounce,
        RouterLink,
        Dialog,
        PrintableOrderInvoice,
        LoadingDisabledDirective,
        ButtonDirective,
        ListboxModule,
    ],
    templateUrl: './orders.html',
    styleUrl: './orders.css',
})
export class Orders extends BaseComponent {
    OrderPaymentType = OrderPaymentType;
    initialSearchFormValue = {
        searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
        searchEnum: this.fb.control<OrderSearchEnum>(OrderSearchEnum.CustomerName, [Validators.required]),
        fromDate: this.fb.control<string | null>(null, []),
        toDate: this.fb.control<string>(this.localDateIso, [Validators.required]),
    };

    fg = this.fb.group(this.initialSearchFormValue);

    orderService = inject(OrderService);

    filterMenuItems = signal([
        {
            label: 'اسم العميل',
            value: OrderSearchEnum.CustomerName,
        },
        {
            label: 'رقم الطلب',
            value: OrderSearchEnum.OrderNumber,
        },
    ]);

    constructor() {
        super();

        this.searchOrders(1);
    }

    periodOptions = [
        { label: 'الكل', value: null },
        { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
        { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
        { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
        { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
    ];

    orders = signal<IOrderSearchRow[]>([]);
    ordersPaginationInfo = signal<IPaginationInfo>({
        pageIndex: 1,
        totalPagesCount: 0,
        totalRowsCount: 0,
    });

    searchOrders(pageIndex: number) {
        this.orderService
            .search({
                paginationInfo: {
                    pageIndex: pageIndex,
                    pageSize: 10,
                },
                searchFilters: [
                    {
                        column: this.fg.getRawValue().searchEnum,
                        values: [this.fg.getRawValue().searchTerm],
                    },
                ],
                fromDate: this.fg.getRawValue().fromDate,
            })
            .subscribe({
                next: (res) => {
                    this.orders.set(res.value.rows);
                    this.ordersPaginationInfo.set({
                        pageIndex,
                        totalPagesCount: res.value.paginationInfo.totalPagesCount,
                        totalRowsCount: res.value.paginationInfo.totalRowsCount,
                    });
                },
            });
    }

    onSubmit = () => this.fg.valid && this.searchOrders(1);

    onPageChange = (event: PaginatorState) => this.searchOrders(event.page! + 1);

    deleteOrder(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل انت متاكد من حذف الطلب؟',
            header: 'حذف الطلب',
            icon: 'pi pi-info-circle',
            rejectLabel: 'الغاء',
            rejectButtonProps: {
                label: 'الغاء',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'حذف',
                severity: 'danger',
            },

            accept: () => this.orderService.delete(id).subscribe({ next: () => this.searchOrders(1) }),
            reject: () =>
                this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
        });
    }

    printService = inject(PrinterService);
    printerSettingsService = inject(PrinterSettingsService);
    currentOrderBill = signal<IOrderBillReadResponse | null>(null);
    printableOrderInvoice = viewChild<PrintableOrderInvoice>('printableOrderInvoice');
    openOrderDialog(id: number) {
        this.orderService.getBill(id).subscribe({
            next: (order) => {
                this.currentOrderBill.set(order);
                this.orderDialogVisible = true;
            },
        });
    }

    /**
     * Groups items and their modifiers by printer id.
     * Returns a map where key is printer id and value contains the printer info + items.
     */
    private groupItemsByPrinter(
        bill: IOrderBillReadResponse,
    ): Map<number, { printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }> {
        const groups = new Map<
            number,
            { printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }
        >();

        for (const item of bill.items) {
            // Group item by its own printer
            const itemPrinterId = item.printer?.id;
            if (itemPrinterId != null) {
                if (!groups.has(itemPrinterId)) {
                    groups.set(itemPrinterId, { printer: item.printer, items: [] });
                }
                groups.get(itemPrinterId)!.items.push(item);
            }

            // Group modifiers by their own printers
            for (const modifier of item.modifiers ?? []) {
                const modPrinterId = modifier.printer?.id;
                if (modPrinterId != null) {
                    if (!groups.has(modPrinterId)) {
                        groups.set(modPrinterId, {
                            printer: {
                                id: modifier.printer.id,
                                name: modifier.printer.name,
                                ipAddressOrMacAddress: modifier.printer.ipAddressOrMacAddress,
                                port: modifier.printer.port,
                                type: modifier.printer.type,
                            },
                            items: [],
                        });
                    }
                    // Add modifier as a pseudo-item for this printer
                    groups.get(modPrinterId)!.items.push({
                        ...item,
                        name: `+ ${modifier.name}`,
                        qty: modifier.qty,
                        unitPrice: modifier.unitPrice,
                        modifiers: [],
                    });
                }
            }
        }

        return groups;
    }

    /**
     * Generates a simplified kitchen/captain receipt HTML (no prices, just items + qty).
     */
    private generateSimplifiedReceiptHtml(
        bill: IOrderBillReadResponse,
        items: IOrderBillReadResponse['items'],
        title: string,
    ): string {
        const itemRows = items
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

        const totalQty = items.reduce((sum, item) => {
            let qty = item.qty;
            for (const modifier of item.modifiers ?? []) {
                qty += modifier.qty;
            }
            return sum + qty;
        }, 0);

        return `
<div style="direction:rtl;padding:8px;font-family:'Cairo',sans-serif;font-size:14px;max-width:300px;">
  <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
    ${title}
  </div>
  <div style="margin-bottom:8px;text-align:center;font-size:12px;">
    <div>رقم الفاتورة ${bill.invoiceNo}</div>
    <div>${new DatePipe('en-US').transform(bill.dateTime, 'dd/MM/yyyy h:mm a')}</div>
    <div>نوع الطلب: ${bill.orderType === 1 ? 'سفري' : bill.orderType === 2 ? 'محلي' : 'توصيل'}</div>
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

    printOrder() {
        const bill = this.currentOrderBill();
        if (!bill) return;

        this.printerSettingsService.getSettings().subscribe({
            next: (settings) => {
                const options: IPrintOrderOption[] = [];
                const baseCss = `
          body { font-family: 'Cairo', sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { padding: 4px; }
        `;

                // ── Kitchen (programPrinter): group items by their item-level printer id ──
                if (settings.programPrinter?.id) {
                    const kitchenGroups = this.groupItemsByPrinter(bill);
                    for (const [, group] of kitchenGroups) {
                        options.push({
                            printer: {
                                id: group.printer.id,
                                name: group.printer.name,
                                ipAddressOrMacAddress: group.printer.ipAddressOrMacAddress,
                                port: group.printer.port,
                                type: group.printer.type,
                                comPort: (group.printer as any).comPort ?? 0,
                                appPrinterType: AppPrinterType.programPrinter,
                            },
                            html: this.generateSimplifiedReceiptHtml(bill, group.items, 'فاتورة المطبخ'),
                            css: baseCss,
                        });
                    }
                }

                // ── Captain (captionOrderPrinter): full receipt, simplified format ──
                if (settings.captionOrderPrinter?.id) {
                    options.push({
                        printer: {
                            id: settings.captionOrderPrinter.id,
                            name: settings.captionOrderPrinter.name,
                            ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                            port: settings.captionOrderPrinter.port,
                            type: settings.captionOrderPrinter.type,
                            comPort: settings.captionOrderPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.captionOrderPrinter,
                        },
                        html: this.generateSimplifiedReceiptHtml(bill, bill.items, 'أمر كابتن'),
                        css: baseCss,
                    });
                }

                // ── Cashier (cashierPrinter): full receipt, full format with prices ──
                if (settings.cashierPrinter?.id) {
                    options.push({
                        printer: {
                            id: settings.cashierPrinter.id,
                            name: settings.cashierPrinter.name,
                            ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                            port: settings.cashierPrinter.port,
                            type: settings.cashierPrinter.type,
                            comPort: settings.cashierPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.cashierPrinter,
                        },
                        html: this.generateCashierReceiptHtml(bill, bill.items),
                        css: baseCss,
                    });
                }

                if (options.length === 0) {
                    this.printService.openPrinterDialog({
                        css: this.printableOrderInvoice()?.styles ?? '',
                        html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                    });
                    return;
                }

                this.printService.openPrinterDialogWithJobs(options);
            },
            error: () => {
                this.printService.openPrinterDialog({
                    css: this.printableOrderInvoice()?.styles ?? '',
                    html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                });
            },
        });
    }

    /**
     * Generates a full cashier-style receipt HTML for a group of items.
     */
    private generateCashierReceiptHtml(bill: IOrderBillReadResponse, items: IOrderBillReadResponse['items']): string {
        const itemRows = items
            .map((item) => {
                let rows = `
      <tr>
        <td style="padding:4px;text-align:right;">${item.name}</td>
        <td style="padding:4px;text-align:center;">${item.qty}</td>
        <td style="padding:4px;text-align:left;">${item.unitPriceWithTax?.toFixed(2)}</td>
      </tr>`;
                for (const modifier of item.modifiers ?? []) {
                    rows += `
      <tr>
        <td style="padding:4px 16px 4px 4px;text-align:right;color:#555;font-size:12px;">+ ${modifier.name}</td>
        <td style="padding:4px;text-align:center;color:#555;font-size:12px;">${modifier.qty}</td>
        <td style="padding:4px;text-align:left;color:#555;font-size:12px;">${modifier.unitPriceWithTax?.toFixed(2)}</td>
      </tr>`;
                }
                return rows;
            })
            .join('');

        const totalUnitPrice = items.reduce((sum, item) => {
            let itemTotal = (item.unitPriceWithTax ?? 0) * item.qty;
            for (const modifier of item.modifiers ?? []) {
                itemTotal += (modifier.unitPriceWithTax ?? 0) * modifier.qty;
            }
            return sum + itemTotal;
        }, 0);

        return `
<div style="direction:rtl;padding:8px;font-family:'Cairo',sans-serif;font-size:14px;max-width:300px;">
  <div style="text-align:center;margin-bottom:8px;font-weight:bold;font-size:16px;">
    فاتورة كاشير
  </div>
  <div style="margin-bottom:8px;font-size:12px;text-align:center;">
    <div><strong>رقم الفاتورة:</strong> ${bill.invoiceNo}</div>
    <div><strong>رقم الطلب:</strong> ${bill.orderNo}</div>
    <div><strong>التاريخ:</strong> ${new DatePipe('en-US').transform(bill.dateTime, 'dd/MM/yyyy h:mm a')}</div>
    <div><strong>العميل:</strong> ${bill.customer?.name ?? ''}</div>
    <div><strong>رقم الجوال:</strong> ${bill.customer?.phone ?? ''}</div>
    <div><strong>نوع الدفع:</strong> ${bill.paymentType ? 'مدفوع' : 'غير مدفوع'}</div>
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
</div>`;
    }

    orderDialogVisible = false;

    showPaymentDialog() {
        this.orderDialogVisible = true;
    }
    getOrderItem(item: IOrderBillReadResponse['items'][0]) {
        if (item.mealId) {
            return {
                name: item.name,
                quantity: item.qty,
                net: item.netUnitPriceWithTax,
            };
        } else {
            return {
                name: item.name,
                quantity: item.qty,
                net: item.netUnitPriceWithTax,
            };
        }
    }
}
