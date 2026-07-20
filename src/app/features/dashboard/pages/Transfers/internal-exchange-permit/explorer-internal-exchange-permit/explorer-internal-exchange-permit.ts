import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { IssueOrderListItem, IssueOrderSearchQuery } from '../models/issue-order';
import { IssueOrderService } from '../services/issue-order-service';

@Component({
  selector: 'app-explorer-internal-exchange-permit',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-internal-exchange-permit.html',
  styleUrl: './explorer-internal-exchange-permit.scss',
})
export class ExplorerInternalExchangePermit implements OnInit {
  private readonly _issueOrderService = inject(IssueOrderService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه أذن صرف داخلي',
    action: '/internal-exchange-permit/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: IssueOrderListItem[] = [];
  idDelete = 0;
  showDeleteDialog = false;
  activeSearchFilter: IssueOrderSearchQuery['filter'] | null = null;

  filteringData = [
    {
      label: 'رقم الإذن',
      key: 'invoiceNo',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-6',
      placeholder: 'رقم الإذن',
    },
    {
      label: 'المرجع',
      key: 'referenceNo',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-6',
      placeholder: 'المرجع',
    },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    const request$ = this.activeSearchFilter
      ? this._issueOrderService.search<IssueOrderSearchQuery>({
          filter: this.activeSearchFilter,
          pagination: {
            pageIndex: page,
            pageSize: this.rows,
          },
        })
      : this._issueOrderService.getAllSendInQuery(page, this.rows);

    request$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.itemsTable = res?.data?.rows ?? [];
          this.totalRecords = res?.data?.paginationInfo?.totalRowsCount ?? 0;
          this._cdr.detectChanges();
        },
      });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.loadData();
  }

  onEditData(id: number): void {
    this._sharedStateService.setSelectedId(id);
    this._router.navigate(['/internal-exchange-permit/add']);
  }

  delete(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._issueOrderService
      .delete(this.idDelete)
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

  onSearch(value: { key: string; value: string }): void {
    this.first = 0;

    if (!value.key || !value.value?.trim()) {
      this.activeSearchFilter = null;
      this.loadData();
      return;
    }

    this.activeSearchFilter = {
      [value.key]: value.value.trim(),
    };
    this.loadData();
  }

  getInvoiceNo(item: IssueOrderListItem): string {
    return item.invoiceNo != null ? String(item.invoiceNo) : '-';
  }

  getReferenceNo(item: IssueOrderListItem): string {
    return item.referenceNo?.trim() || '-';
  }

  getDate(item: IssueOrderListItem): string {
    if (!item.invoiceDate) return '-';
    return item.invoiceDate.split('T')[0];
  }

  getWarehouse(item: IssueOrderListItem): string {
    return item.warehouseName ?? '-';
  }

  getAccount(item: IssueOrderListItem): string {
    return item.customerName ?? item.accountName ?? '-';
  }
}
