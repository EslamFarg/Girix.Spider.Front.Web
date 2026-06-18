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
import { IAccountBalanceRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-balance-sheet',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './balance-sheet.html',
  styleUrl: './balance-sheet.css',
})
export class BalanceSheet extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
    accountId: this.fb.control<number>(0),
    customerId: this.fb.control<number>(0),
    supplierId: this.fb.control<number>(0),
    itemId: this.fb.control<number>(0),
    categoryId: this.fb.control<number>(0),
    userId: this.fb.control<number>(0),
    paymentType: this.fb.control<number>(0),
    searchTerm: this.fb.control<string>(''),
  });

  columns: IReportColumn[] = [
    { key: 'accountId', label: 'كود الحساب' },
    { key: 'accountNameAr', label: 'اسم الحساب' },
    { key: 'stage', label: 'المرحلة', type: 'currency', total: true },
    { key: 'balance', label: 'الرصيد', type: 'currency', total: true },
  ];

  rows = signal<IAccountBalanceRow[]>([]);
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
      { label: 'رقم الحساب', value: v.accountId },
      { label: 'رقم العميل', value: v.customerId },
      { label: 'رقم المورد', value: v.supplierId },
      { label: 'رقم المنتج', value: v.itemId },
      { label: 'رقم المجموعة', value: v.categoryId },
      { label: 'رقم المستخدم', value: v.userId },
      { label: 'نوع الدفع', value: v.paymentType },
      
    ]);
    const pageNumber = pageIndex ;
    this.reportsService.getBalanceSheet({ ...v, pageNumber, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
