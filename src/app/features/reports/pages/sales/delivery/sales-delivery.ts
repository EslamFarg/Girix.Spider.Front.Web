import { Component, inject, OnDestroy, signal } from '@angular/core';
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
import { ISalesDeliveryRow } from '../../../types/api/reports-types';
import { MaintenanceService } from '@/features/settings/services/maintenance-service';

@Component({
  selector: 'app-sales-delivery-report',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './sales-delivery.html',
  styleUrl: './sales-delivery.css',
})
export class SalesDelivery extends BaseComponent implements OnDestroy {
  reportsService = inject(ReportsService);
  maintenanceService = inject(MaintenanceService);
  deliveryResetSub?: ReturnType<typeof this.maintenanceService.deliveryReset$.subscribe>;

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
  });

  columns: IReportColumn[] = [
    { key: 'orderId', label: 'رقم الطلب' },
    { key: 'orderNumber', label: 'رقم الفاتورة', type: 'number' },
    { key: 'createdAt', label: 'التاريخ', type: 'date' },
    { key: 'totalSales', label: 'المبيعات', type: 'currency', total: true },
    { key: 'totalCost', label: 'التكلفة', type: 'currency', total: true },
    { key: 'profit', label: 'الربح', type: 'currency', total: true },
  ];

  rows = signal<ISalesDeliveryRow[]>([]);
  lastSearchFilters = signal<IReportFilter[]>([]);
  paginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  constructor() {
    super();
    this.search(1);
    this.deliveryResetSub = this.maintenanceService.deliveryReset$.subscribe(() => {
      this.fg.reset({ fromDate: null, toDate: null });
      this.search(1);
    });
  }

  override ngOnDestroy() {
    this.deliveryResetSub?.unsubscribe();
    super.ngOnDestroy();
  }

  search(pageIndex: number) {
    const v = this.fg.getRawValue();
    this.lastSearchFilters.set([
      { label: 'من تاريخ', value: v.fromDate },
      { label: 'إلى تاريخ', value: v.toDate },
    ]);
    this.reportsService.getSalesDelivery({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
