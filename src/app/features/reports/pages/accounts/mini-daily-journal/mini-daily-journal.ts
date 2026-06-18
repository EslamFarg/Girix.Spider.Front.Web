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
import { IMiniDailyJournalRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-mini-daily-journal',
  imports: [SectionWrapper, ReactiveFormsModule, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule, ReportPrintView],
  templateUrl: './mini-daily-journal.html',
  styleUrl: './mini-daily-journal.css',
})
export class MiniDailyJournal extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
    searchTerm: this.fb.control<string>(''),
  });

  columns: IReportColumn[] = [
    { key: 'userNameAr', label: 'اسم المستخدم' },
    { key: 'openStartDate', label: 'تاريخ الافتتاح', type: 'date' },
    { key: 'endEndDate', label: 'تاريخ الاغلاق', type: 'date' },
    { key: 'openingBalance', label: 'البدء' },
    { key: 'cashClosingAmount', label: 'كمية نقد الاغلاق', type: 'currency', total: true },
    { key: 'networkClosingAmount', label: ' كمية شبكة الاغلاق', type: 'currency', total: true },
    { key: 'totalShortage', label: ' النقص', type: 'currency', total: true },
  ];

  rows = signal<IMiniDailyJournalRow[]>([]);
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
    this.reportsService.getMiniDailyJournal({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
