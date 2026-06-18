import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { InputTextModule } from 'primeng/inputtext';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { TooltipModule } from 'primeng/tooltip';
import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ReportsService } from '../../../services/reports-service';
import { IInventoryValueByItemRow } from '../../../types/api/reports-types';

@Component({
  selector: 'app-inventory-value-by-items',
  imports: [SectionWrapper, ReactiveFormsModule, DatePipe, Paginator, InputTextModule, InputGroupAddon, LoadingDisabledDirective, TooltipModule],
  templateUrl: './value-by-items.html',
  styleUrl: './value-by-items.css',
})
export class InventoryValueByItems extends BaseComponent {
  reportsService = inject(ReportsService);

  fg = this.fb.group({
    fromDate: this.fb.control<string | null>(null),
    toDate: this.fb.control<string | null>(null),
  });

  rows = signal<IInventoryValueByItemRow[]>([]);
  paginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };

  constructor() {
    super();
    this.search(1);
  }

  search(pageIndex: number) {
    const v = this.fg.getRawValue();
    this.reportsService.getInventoryValueByItems({ ...v, pageIndex, pageSize: 10 }).subscribe({
      next: (res) => {
        this.rows.set(res.rows);
        this.paginationInfo = { pageIndex, totalPagesCount: res.paginationInfo.totalPagesCount, totalRowsCount: res.paginationInfo.totalRowsCount };
      },
    });
  }

  onSubmit = () => this.search(1);
  onPageChange = (event: PaginatorState) => this.search(event.page! + 1);
}
