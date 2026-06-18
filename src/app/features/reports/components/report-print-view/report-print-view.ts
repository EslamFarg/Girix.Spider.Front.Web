import { Component, ViewEncapsulation, computed, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';
import { IPaginationInfo } from '@/components/base-component/base-component';

export interface IReportColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency';
  total?: boolean;
}

export interface IReportFilter {
  label: string;
  value: string | number | null | undefined;
}

@Component({
  selector: 'app-report-print-view',
  imports: [DatePipe, Paginator, TooltipModule],
  templateUrl: './report-print-view.html',
  styleUrl: './report-print-view.css',
  encapsulation: ViewEncapsulation.None,
})
export class ReportPrintView {
  title = input.required<string>();
  columns = input.required<IReportColumn[]>();
  rows = input<any[]>([]);
  filters = input<IReportFilter[]>([]);
  paginationInfo = input<IPaginationInfo>({ pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 });
  isLoading = input<boolean>(false);

  pageChange = output<PaginatorState>();

  printDate = new Date();

  activeFilters = computed(() =>
    this.filters().filter((f) => f.value != null && f.value !== ''),
  );

  computedTotals = computed(() => {
    const totalCols = this.columns().filter((c) => c.total);
    if (!totalCols.length) return null;
    const result: Record<string, number> = {};
    for (const col of totalCols) {
      result[col.key] = this.rows().reduce((sum, row) => sum + (Number(row[col.key]) || 0), 0);
    }
    return result;
  });

  print() {
    window.print();
  }

  getRowNumber = (index: number, pageIndex: number) => index + 1 + (pageIndex - 1) * 10;
  getCurrentRowsIx = (pageIndex: number) => (pageIndex - 1) * 10;

  onPageChange(event: PaginatorState) {
    this.pageChange.emit(event);
  }
}
