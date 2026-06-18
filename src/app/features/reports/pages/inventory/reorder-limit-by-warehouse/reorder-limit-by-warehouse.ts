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
import { IReorderLimitRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-inventory-reorder-limit',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './reorder-limit-by-warehouse.html',
  styleUrl: './reorder-limit-by-warehouse.css',
})
export class InventoryReorderLimitByWarehouse extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    searchTerm: this.fb.control<string>(''),
    warehouseId: this.fb.control<number | null>(null),
  });

  columns: IReportColumn[] = [
    { key: 'itemCode', label: 'كود الصنف' },
    { key: 'itemName', label: 'اسم الصنف' },
    { key: 'warehouseName', label: 'المستودع' },
    { key: 'currentQuantity', label: 'الكمية الحالية', type: 'number' },
    { key: 'reorderLimit', label: 'حد الطلب', type: 'number' },
    { key: 'shortage', label: 'العجز', type: 'number' },
  ];

  rows = signal<IReorderLimitRow[]>([]);
  lastSearchFilters = signal<IReportFilter[]>([]);
  paginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  constructor() {
    super();
    this.search(1);
  }

  search(pageIndex: number) {
    const v = this.fg.getRawValue();
    this.lastSearchFilters.set([
      { label: 'بحث', value: v.searchTerm || null },
    ]);
    this.reportsService.getReorderLimitByWarehouse({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
