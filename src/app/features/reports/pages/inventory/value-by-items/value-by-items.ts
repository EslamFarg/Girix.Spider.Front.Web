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
import { IInventoryValueByItemRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-inventory-value-by-items',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './value-by-items.html',
  styleUrl: './value-by-items.css',
})
export class InventoryValueByItems extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
    warehouseId: this.fb.control<number | null>(null),
    groupId: this.fb.control<number | null>(null),
  });

  columns: IReportColumn[] = [
    { key: 'itemId', label: 'كود الصنف' },
    { key: 'itemNameAr', label: 'اسم الصنف' },
    { key: 'quantity', label: 'الكمية', type: 'number' },
    { key: 'costPrice', label: 'سعر التكلفة', type: 'currency' },
    { key: 'totalValue', label: 'القيمة الإجمالية', type: 'currency', total: true },
  ];

  rows = signal<IInventoryValueByItemRow[]>([]);
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
    this.reportsService.getInventoryValueByItems({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
