import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import {
  SalaryPostingModel,
  SalaryPostingSearchFilter,
  SalaryPostingSearchModel,
} from '../models/proof-of-salary';
import { ProofService } from '../services/proof-service';

@Component({
  selector: 'app-explorer-proof-of-salary',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-proof-of-salary.html',
  styleUrl: './explorer-proof-of-salary.scss',
})
export class ExplorerProofOfSalary implements OnInit {
  private readonly _proofService = inject(ProofService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'إثبات رواتب جديد',
    action: '/hr/proof-of-salaries/add',
  };

  filteringData = [
    {
      label: 'رقم الإثبات',
      key: 'postingNo',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-12',
      placeholder: 'رقم الإثبات',
    },
    // {
    //   label: 'الحالة',
    //   key: 'status',
    //   type: 'number',
    //   value: '',
    //   class: 'col-span-12 md:col-span-6',
    //   placeholder: 'الحالة',
    // },
    // {
    //   label: 'تاريخ الإثبات من',
    //   key: 'fromDate',
    //   type: 'date',
    //   value: null,
    //   class: 'col-span-12 md:col-span-6',
    //   placeholder: 'تاريخ الإثبات من',
    // },
    // {
    //   label: 'تاريخ الإثبات إلى',
    //   key: 'toDate',
    //   type: 'date',
    //   value: null,
    //   class: 'col-span-12 md:col-span-6',
    //   placeholder: 'تاريخ الإثبات إلى',
    // },
    {
      label: 'الفترة من',
      key: 'fromDate',
      type: 'date',
      value: new Date(),
      class: 'col-span-12 md:col-span-6',
      placeholder: 'الفترة من',
    },
    {
      label: 'الفترة إلى',
      key: 'toDate',
      type: 'date',
      value: new Date(),
      class: 'col-span-12 md:col-span-6',
      placeholder: 'الفترة إلى',
    },
  ];

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: SalaryPostingModel[] = [];
  idDelete = 0;
  showDeleteDialog = false;
  activeSearchFilter: SalaryPostingSearchFilter | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const page = Math.floor(this.first / this.rows) + 1;
    const payload: SalaryPostingSearchModel = {
      pagination: {
        pageIndex: page,
        pageSize: this.rows,
      },
      filter: this.activeSearchFilter ?? {},
    };

    this._proofService
      .searchSalaryPostings(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.itemsTable = res.data?.rows ?? [];
          this.totalRecords = res.data?.paginationInfo?.totalRowsCount ?? 0;
          this._cdr.detectChanges();
        },
      });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.loadData();
  }

  onSearch(
    event: { filters?: Record<string, string> } | { key: string; value: string }
  ): void {
    this.first = 0;

    if ('key' in event) {
      this.activeSearchFilter = this.buildSearchFilter({
        [event.key]: event.value.trim(),
      });
    } else {
      this.activeSearchFilter = this.buildSearchFilter(event.filters ?? {});
    }

    this.loadData();
  }

  private buildSearchFilter(values: Record<string, string>): SalaryPostingSearchFilter {
    const filter: SalaryPostingSearchFilter = {};

    if (values['postingNo']?.trim()) {
      filter.postingNo = values['postingNo'].trim();
    }

    const fromDate = this.toDateTimeStart(values['fromDate']);
    if (fromDate) {
      filter.fromDate = fromDate;
    }

    const toDate = this.toDateTimeEnd(values['toDate']);
    if (toDate) {
      filter.toDate = toDate;
    }

    const periodFrom = this.toDateTimeStart(values['periodFrom']);
    if (periodFrom) {
      filter.periodFrom = periodFrom;
    }

    const periodTo = this.toDateTimeEnd(values['periodTo']);
    if (periodTo) {
      filter.periodTo = periodTo;
    }

    if (values['status']?.trim()) {
      const status = Number(values['status']);
      if (!Number.isNaN(status)) {
        filter.status = status;
      }
    }

    return filter;
  }

  private toDateTimeStart(dateValue?: string): string | null {
    if (!dateValue?.trim()) {
      return null;
    }

    return new Date(`${dateValue}T00:00:00.000Z`).toISOString();
  }

  private toDateTimeEnd(dateValue?: string): string | null {
    if (!dateValue?.trim()) {
      return null;
    }

    return new Date(`${dateValue}T23:59:59.999Z`).toISOString();
  }

  onEditData(id: number): void {
    this._sharedStateService.setSelectedId(id);
    this._router.navigate(['/hr/proof-of-salaries/add']);
  }

  delete(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._proofService
      .deleteSalaryPosting(this.idDelete)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.idDelete = 0;
          this.loadData();
        },
      });
  }

  getPostingNumber(item: SalaryPostingModel): string {
    const value = item.postingNo ?? item.postingNumber;
    return value != null ? String(value) : '-';
  }

  getPeriodFrom(item: SalaryPostingModel): string {
    if (item.periodFrom == null) {
      return '-';
    }
    return item.periodFrom != null ? String(item.periodFrom).split('T')[0] : '-';
  }

  getPeriodTo(item: SalaryPostingModel): string {
    if (item.periodTo == null) {
      return '-';
    }
    return item.periodTo.split('T')[0];
  }

  getPostingDate(item: SalaryPostingModel): string {
    if (!item.postingDate) {
      return '-';
    }
    return item.postingDate.split('T')[0];
  }

  getStatus(item: SalaryPostingModel): string {
    return item.statusName ?? (item.status != null ? String(item.status) : '-');
  }

  getEmployeesCount(item: SalaryPostingModel): string {
    return item.employeesCount != null ? String(item.employeesCount) : '-';
  }

  getTotalNetSalary(item: SalaryPostingModel): string {
    const value = item.totalNetSalary ?? item.netSalary;
    return value != null ? String(value) : '-';
  }
}
