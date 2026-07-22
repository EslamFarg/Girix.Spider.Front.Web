import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import {
  DirectTransferListItem,
  DirectTransferListResponse,
  DirectTransferSearchQuery,
} from '../models/direct-transfer';
import { DirectTransferService } from '../services/direct-transfer-service';

@Component({
  selector: 'app-explorer-transfer-between-repositry',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-transfer-between-repositry.html',
  styleUrl: './explorer-transfer-between-repositry.scss',
})
export class ExplorerTransferBetweenRepositry implements OnInit {
  private readonly _directTransferService = inject(DirectTransferService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه تحويلات بين المستودعات',
    action: '/transfer-between-repositry/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: DirectTransferListItem[] = [];
  idDelete = 0;
  showDeleteDialog = false;
  activeSearchCode: string | null = null;

  filteringData = [
    {
      label: 'رقم الطلب',
      key: 'code',
      type: 'text',
      value: '',
      class: 'col-span-12',
      placeholder: 'رقم الطلب',
    },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    const request$ = this.activeSearchCode
      ? this._directTransferService.search<DirectTransferSearchQuery>({
          code: this.activeSearchCode,
          pagination: {
            pageIndex: page,
            pageSize: this.rows,
          },
        })
      : this._directTransferService.getAllSendInBody({
          pageIndex: page,
          pageSize: this.rows,
        });

    request$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const response = res as DirectTransferListResponse;
          this.itemsTable = response.data?.rows ?? [];
          this.totalRecords = response.data?.paginationInfo?.totalRowsCount ?? 0;
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
    this._router.navigate(['/transfer-between-repositry/add']);
  }

  delete(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._directTransferService
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
      this.activeSearchCode = null;
      this.loadData();
      return;
    }

    if (value.key !== 'code') {
      return;
    }

    this.activeSearchCode = value.value.trim();
    this.loadData();
  }

  getRequestNumber(item: DirectTransferListItem): string {
    return item.code != null ? String(item.code) : '-';
  }

  getDate(item: DirectTransferListItem): string {
    const value = item.date ?? item.transferDate ?? item.createdDate;
    if (!value) {
      return '-';
    }
    return value.split('T')[0];
  }

  getFromWarehouse(item: DirectTransferListItem): string {
    return item.fromWarehouseName ?? '-';
  }

  getToWarehouse(item: DirectTransferListItem): string {
    return item.toWarehouseName ?? '-';
  }

  getEmployeeName(item: DirectTransferListItem): string {
    return item.employeeName ?? '-';
  }
}
