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
import { IPurchaseReportRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-purchases-list-report',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './purchases-list.html',
  styleUrl: './purchases-list.css',
})
export class PurchasesListReport extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
    searchTerm: this.fb.control<string>(''),
    supplierId: this.fb.control<number | null>(0),
  });

  columns: IReportColumn[] = [
    { key: 'invoiceNumber', label: 'رقم الفاتورة' },
    { key: 'invoiceDate', label: 'التاريخ', type: 'date' },
    { key: 'supplierName', label: 'المورد' },
    { key: 'cashAmount', label: 'الكاش' },
    { key: 'networkAmount', label: 'الشبكة', type: 'currency', total: true },
    { key: 'totalAmount', label: 'الإجمالي', type: 'currency', total: true },
    { key: 'taxAmount', label: 'الضريبة', type: 'currency' },
  ];

  rows = signal<IPurchaseReportRow[]>([]);
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
    this.reportsService.getPurchasesList({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
