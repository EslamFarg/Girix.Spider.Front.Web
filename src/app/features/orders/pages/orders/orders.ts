import { ReceiptTemplateService } from '../../services/receipt-template-service';
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
import { PrinterService, IPrintJob, AppPrinterType } from '@/features/printers';
import { RouterLink } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { FormControlNotifier } from '@/directives/form-control-notifier';
import { PrintableOrderInvoice } from '@/features/orders/components/printable-order-invoice/printable-order-invoice';
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ListboxModule } from 'primeng/listbox';
import { TooltipModule } from 'primeng/tooltip';

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
        TooltipModule
    ],
    templateUrl: './orders.html',
    styleUrl: './orders.css',
})
export class Orders extends BaseComponent {
    receiptTemplateService = inject(ReceiptTemplateService);
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
    /**
     * Returns a map where key is category id and value contains the category info + items.
     */
    private groupItemsByCategory(
        bill: IOrderBillReadResponse,
        defaultPrinter: IOrderBillReadResponse['items'][0]['printer'] | null,
    ): Map<number, { name: string; printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }> {
        const groups = new Map<
            number,
            { name: string; printer: IOrderBillReadResponse['items'][0]['printer']; items: IOrderBillReadResponse['items'] }
        >();

        for (const item of bill.items) {
            // Use item's category, or fall back to default printer's category (group 0)
            const categoryId = item.categoryId ?? 0;
            const categoryName = item.categoryName ?? (defaultPrinter?.name ?? 'مطبخ');
            const itemPrinter = item.printer ?? defaultPrinter;
            
            if (itemPrinter != null) {
                if (!groups.has(categoryId)) {
                    groups.set(categoryId, { name: categoryName, printer: itemPrinter, items: [] });
                }
                groups.get(categoryId)!.items.push(item);
            }

            // Group modifiers by their own printers (with fallback) but same category
            for (const modifier of item.modifiers ?? []) {
                const modPrinter = modifier.printer ?? defaultPrinter;
                if (modPrinter != null) {
                    if (!groups.has(categoryId)) {
                        groups.set(categoryId, {
                            name: categoryName,
                            printer: {
                                id: modPrinter.id,
                                name: modPrinter.name,
                                ipAddressOrMacAddress: modPrinter.ipAddressOrMacAddress,
                                port: modPrinter.port,
                                type: modPrinter.type,
                            },
                            items: [],
                        });
                    }
                    groups.get(categoryId)!.items.push({
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

    printOrder() {
        const bill = this.currentOrderBill();
        if (!bill) return;

        this.printerSettingsService.getSettings().subscribe({
            next: (settings) => {
                const jobs: IPrintJob[] = [];

                // ── Kitchen (programPrinter): group items by their category id ──
                if (settings.programPrinter?.id) {
                    const kitchenGroups = this.groupItemsByCategory(bill, settings.programPrinter);
                    for (const [, group] of kitchenGroups) {
                        jobs.push({
                            printer: {
                                id: group.printer.id,
                                name: group.printer.name,
                                ipAddressOrMacAddress: group.printer.ipAddressOrMacAddress,
                                port: group.printer.port,
                                type: group.printer.type,
                                comPort: (group.printer as any).comPort ?? 0,
                                appPrinterType: AppPrinterType.programPrinter,
                            },
                            html: this.receiptTemplateService.generateKitchenReceiptHtml(bill, group.items, group.name).html,
                            css: this.receiptTemplateService.generateKitchenReceiptHtml(bill, group.items, group.name).css,
                        });
                    }
                }

                // ── Captain (captionOrderPrinter): full receipt, simplified format ──
                if (settings.captionOrderPrinter?.id) {
                    jobs.push({
                        printer: {
                            id: settings.captionOrderPrinter.id,
                            name: settings.captionOrderPrinter.name,
                            ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                            port: settings.captionOrderPrinter.port,
                            type: settings.captionOrderPrinter.type,
                            comPort: settings.captionOrderPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.captionOrderPrinter,
                        },
                        html: this.receiptTemplateService.generateCaptainReceiptHtml(bill, bill.items).html,
                        css: this.receiptTemplateService.generateCaptainReceiptHtml(bill, bill.items).css,
                    });
                }

                // ── Cashier (cashierPrinter): full receipt, full format with prices ──
                if (settings.cashierPrinter?.id) {
                    jobs.push({
                        printer: {
                            id: settings.cashierPrinter.id,
                            name: settings.cashierPrinter.name,
                            ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                            port: settings.cashierPrinter.port,
                            type: settings.cashierPrinter.type,
                            comPort: settings.cashierPrinter.comPort ?? 0,
                            appPrinterType: AppPrinterType.cashierPrinter,
                        },
                        html: this.receiptTemplateService.generateCashierReceiptHtml(bill, bill.items).html,
                        css: this.receiptTemplateService.generateCashierReceiptHtml(bill, bill.items).css,
                    });
                }

                if (jobs.length === 0) {
                    this.printService.printNow([{
                        printer: { id: 0, name: 'Default', ipAddressOrMacAddress: '', port: 0, type: 0, comPort: 0, appPrinterType: AppPrinterType.cashierPrinter },
                        html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                        css: this.printableOrderInvoice()?.styles ?? '',
                    }]);
                    return;
                }

                this.printService.openPrinterDialogWithJobs(jobs);
            },
            error: () => {
                this.printService.printNow([{
                    printer: { id: 0, name: 'Default', ipAddressOrMacAddress: '', port: 0, type: 0, comPort: 0, appPrinterType: AppPrinterType.cashierPrinter },
                    html: this.printableOrderInvoice()?.html()?.nativeElement.outerHTML ?? '',
                    css: this.printableOrderInvoice()?.styles ?? '',
                }]);
            },
        });
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
