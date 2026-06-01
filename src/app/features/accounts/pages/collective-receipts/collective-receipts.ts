import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { CollectiveReceiptForm } from '../../components/collective-receipt-form/collective-receipt-form';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ReceiptVoucherSearchEnum, ReceiptVoucherService } from '../../services/receipt-voucher-service';
import { IReceiptVoucherSearchRow } from '../../types';
import { AllowNumbers } from '@/directives/allow-numbers';
import { Debounce } from '@/directives/debounce';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Listbox } from "primeng/listbox";

@Component({
    selector: 'app-collective-receipts',
    imports: [
    SectionWrapper,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    InputText,
    AllowNumbers,
    Debounce,
    DatePipe,
    CurrencyPipe,
    TranslatePipe,
    Menu,
    RouterLink,
    ButtonDirective,
    Listbox
],
    templateUrl: './collective-receipts.html',
    styleUrl: './collective-receipts.css',
})
export class CollectiveReceipts extends BaseComponent {
    initialSearchFormValue = {
        searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
        searchEnum: this.fb.control<ReceiptVoucherSearchEnum>(ReceiptVoucherSearchEnum.Id, []),
        fromDate: this.fb.control<string | null>(null, []),
        toDate: this.fb.control<string>(this.dateNowIso, [Validators.required]),
    };

    fg = this.fb.group(this.initialSearchFormValue);
    receiptVoucherService = inject(ReceiptVoucherService);

    filterMenuItems = [
        {
            label: 'رقم القيد',
            value: ReceiptVoucherSearchEnum.Id,
        },
        {
            label: 'الرقم الدفتري',
            value: ReceiptVoucherSearchEnum.VoucherNo,
        },
    ];

    receiptVouchers = signal<IReceiptVoucherSearchRow[]>([]);
    receiptVouchersPaginationInfo: IPaginationInfo = {
        pageIndex: 1,
        totalPagesCount: 0,
        totalRowsCount: 0,
    };

    constructor() {
        super();
        this.searchReceiptVouchers(1);
    }

    searchReceiptVouchers(pageIndex: number) {
        this.receiptVoucherService
            .search({
                paginationInfo: {
                    pageIndex,
                    pageSize: 10,
                },
                searchFilters: [
                    {
                        column: this.fg.getRawValue().searchEnum!,
                        values: [this.fg.getRawValue().searchTerm],
                    },
                ],
                fromDate: this.fg.getRawValue().fromDate,
            })
            .subscribe({
                next: (res) => {
                    this.receiptVouchers.set(res.rows);
                    this.receiptVouchersPaginationInfo = {
                        pageIndex,
                        totalPagesCount: res.paginationInfo.totalPagesCount,
                        totalRowsCount: res.paginationInfo.totalRowsCount,
                    };
                },
            });
    }

    onSubmit = () => {
        console.log(this.fg.value);
        this.fg.valid && this.searchReceiptVouchers(1);
    };

    onPageChange = (event: PaginatorState) => this.searchReceiptVouchers(event.page! + 1);

    deleteReceiptVoucher(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل أنت متأكد من حذف القيد؟',
            header: 'حذف القيد',
            icon: 'pi pi-info-circle',
            rejectLabel: 'إلغاء',
            rejectButtonProps: {
                label: 'إلغاء',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'حذف',
                severity: 'danger',
            },
            accept: () => {
                this.receiptVoucherService.delete(id).subscribe({
                    next: () => {
                        this.searchReceiptVouchers(1);
                    },
                });
            },
            reject: () => {
                this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
            },
        });
    }
}
