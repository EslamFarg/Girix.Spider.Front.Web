import { SectionWrapper, IPaginationInfo, BaseComponent } from '@/components';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ReportPrintView, IReportColumn, IReportFilter } from '@/features/reports/components/report-print-view/report-print-view';
import { ReportsService } from '@/features/reports/services/reports-service';
import { ICategoryProfitRow, ISalesDeliveryRow } from '@/features/reports/types/api/reports-types';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorState } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-category-profit',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './category-profit.html',
  styleUrl: './category-profit.css',
})
export class CategoryProfit  extends BaseComponent{
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
  });

  columns: IReportColumn[] = [
    { key: 'categoryId', label: 'رقم المجموعه', type: 'number' },
    { key: 'categoryNameAr', label: 'اسم المجموعه' },
    { key: 'totalSales', label: 'المبيعات', type: 'currency', total: true },
    { key: 'totalCost', label: 'التكلفة', type: 'currency', total: true },
    { key: 'profit', label: 'الربح', type: 'currency', total: true },
  ];

  rows = signal<ICategoryProfitRow[]>([]);
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
    ]);
    this.reportsService.getCategoryProfit({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);

}
