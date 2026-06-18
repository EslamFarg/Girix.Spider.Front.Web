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
import { IItemMovementRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-inventory-item-movement-full',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './item-movement-full.html',
  styleUrl: './item-movement-full.css',
})
export class InventoryItemMovementFull extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
    searchTerm: this.fb.control<string>(''),
    warehouseId: this.fb.control<number | null>(null),
    itemId: this.fb.control<number | null>(0),
  });

  columns: IReportColumn[] = [
    { key: 'movementDate', label: 'التاريخ', type: 'date' },
    { key: 'itemNameAr', label: 'الصنف' },
    { key: 'movementType', label: 'نوع الحركة' },
    { key: 'referenceNumber', label: 'المرجع' },
    { key: 'quantityIn', label: 'الكمية القادمه', type: 'number' },
    { key: 'quantityOut', label: 'الكمية المنتهيه', type: 'number' },
    { key: 'balance', label: 'الرصيد' , type: 'number' , total: true },
  ];

  rows = signal<IItemMovementRow[]>([]);
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
    this.reportsService.getItemMovementFull({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
