import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ReportPrintView, IReportColumn, IReportFilter } from '../../../components/report-print-view/report-print-view';
import { ReportsService } from '../../../services/reports-service';
import { IDailyTransactionRow } from '../../../types/api/reports-types';

@Component({
    selector: 'app-daily-transaction',
    imports: [
        SectionWrapper,
        ReactiveFormsModule,
        InputTextModule,
        InputGroupAddon,
        LoadingDisabledDirective,
        TooltipModule,
        ReportPrintView,
    ],
    templateUrl: './daily-transaction.html',
    styleUrl: './daily-transaction.css',
})
export class DailyTransaction extends BaseComponent {
    reportsService = inject(ReportsService);

    fg = this.fb.group({
        fromDate: this.fb.control<string | null>(null),
        toDate: this.fb.control<string | null>(null),
        searchTerm: this.fb.control<string>(''),
    });

    columns: IReportColumn[] = [
        { key: 'ordersPaidTotal', label: 'إجمالي الطلبات المدفوعة', type: 'date' },
        { key: 'ordersPendingTotal', label: 'إجمالي الطلبات المعلقة' },
        { key: 'ordersCount', label: 'عدد الطلبات' },
        { key: 'paidReturnTotal', label: 'إجمالي العائد المدفوع', type: 'currency', total: true },
        { key: 'totalPayingCash', label: 'إجمالي المبلغ المدفوع نقدًا', type: 'currency', total: true },
        { key: 'totalPayingNetwork', label: 'شبكة الدفع الكلي', type: 'currency', total: true },
        { key: 'netPayingCashAfterReturn', label: 'الدفع النقدي بعد الإرجاع', type: 'currency', total: true },
        { key: 'netPayingNetworkAfterReturn', label: 'شبكة الدفع بعد الإرجاع', type: 'currency', total: true },
        { key: 'totalPaymentVoucher', label: 'قسيمة الدفع الإجمالية', type: 'currency', total: true },
        { key: 'totalReceiptVoucher', label: 'إجمالي إيصال القسيمة', type: 'currency', total: true },
    ];

   rows = signal<IDailyTransactionRow[]>([]);

    lastSearchFilters = signal<IReportFilter[]>([]);
    paginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

    constructor() {
        super();
        this.search(1);
    }

    search(pageIndex: number) {
        const v = this.fg.getRawValue();
        this.lastSearchFilters.set([
            { label: 'من تاريخ', value: v.fromDate },
            { label: 'إلى تاريخ', value: v.toDate },
            { label: 'بحث', value: v.searchTerm || null },
        ]);
        this.reportsService.getDailyTransaction({ ...v, pageIndex, pageSize: 10 }).subscribe({
            next: (res) => {
                const result = {
                    totalCount: res.length,
                    data: res,
                };

                this.rows.set([result.data]);
                // this.paginationInfo = {
                //     pageIndex,
                //     totalPagesCount: res.paginationInfo.totalPagesCount,
                //     totalRowsCount: res.paginationInfo.totalRowsCount,
                // };
            },
        });
    }

    onSubmit = () => this.search(1);
    onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
