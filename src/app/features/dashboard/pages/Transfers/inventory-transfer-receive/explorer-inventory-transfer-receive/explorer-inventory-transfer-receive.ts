import { NgClass } from '@angular/common';
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { TransferRequestViewType } from '../../../../../../shared/Enums/EnumListTransfer';
import { TransferRequestStatus } from '../../../../../../shared/Enums/EnumStatus';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import {
  TransferRequestListItem,
  TransferRequestListResponse,
  TransferRequestSearchQuery,
} from '../../inventory-transfer-order/models/transfer-request';
import { TransferRequestService } from '../../inventory-transfer-order/services/transfer-request-service';

@Component({
  selector: 'app-explorer-inventory-transfer-receive',
  imports: [PageHeaderSearch, Paginator, SharedConfirmDialog, NgClass],
  templateUrl: './explorer-inventory-transfer-receive.html',
  styleUrl: './explorer-inventory-transfer-receive.scss',
})
export class ExplorerInventoryTransferReceive implements OnInit {
  private readonly _transferRequestService = inject(TransferRequestService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'استلام تحويل مخزني',
    action: '/inventory-transfer-receive/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: TransferRequestListItem[] = [];
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
      ? this._transferRequestService.search<TransferRequestSearchQuery>({
          code: this.activeSearchCode,
          pagination: {
            pageIndex: page,
            pageSize: this.rows,
          },
        })
      : this._transferRequestService.getAllListTransferRequest(
          TransferRequestViewType.ReceiptConfirmation,
          page,
          this.rows,
        );

    request$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const response = res as TransferRequestListResponse;
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
    this._router.navigate(['/inventory-transfer-receive/add']);
  }

  delete(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._transferRequestService
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

    if (!value.key || !value.value) {
      this.activeSearchCode = null;
      this.loadData();
      return;
    }

    if (value.key !== 'code') {
      return;
    }

    this.activeSearchCode = value.value;
    this.loadData();
  }

  getRequestNumber(item: TransferRequestListItem): string {
    const value = item.code ?? item.requestNo;
    return value != null ? String(value) : '-';
  }

  getDate(item: TransferRequestListItem): string {
    const value = item.date ?? item.requestDate;
    if (!value) {
      return '-';
    }
    return value.split('T')[0];
  }

  getFromWarehouse(item: TransferRequestListItem): string {
    return item.fromWarehouseName ?? '-';
  }

  getToWarehouse(item: TransferRequestListItem): string {
    return item.toWarehouseName ?? item.employeeName ?? '-';
  }

  getTotalQuantity(item: TransferRequestListItem): string {
    if (item.totalRequestedQuantity != null) {
      return String(item.totalRequestedQuantity);
    }

    if (item.totalQuantity != null) {
      return String(item.totalQuantity);
    }

    if (item.lines?.length) {
      const total = item.lines.reduce(
        (sum, line) => sum + Number(line.requestedQuantity ?? 0),
        0,
      );
      return String(total);
    }

    return '-';
  }

  getStatus(item: any): string {
    switch (item.status) {
      case TransferRequestStatus.Pending:
        return 'قيد الانتظار';
      case TransferRequestStatus.Approved:
        return 'موافق عليه';
      case TransferRequestStatus.PartiallyApproved:
        return 'موافقة جزئية';
      case TransferRequestStatus.RejectedBySender:
        return 'مرفوض بواسطة المرسل';
      case TransferRequestStatus.Received:
        return 'تم الاستلام';
      case TransferRequestStatus.PartiallyReceived:
        return 'استلام جزئي';
      case TransferRequestStatus.RejectedByReceiver:
        return 'مرفوض بواسطة المستقبل';
      default:
        return '-';
    }
  }

  getStatusClass(status: any): string {
    switch (status) {
      case TransferRequestStatus.Pending:
        return 'status-pending';
      case TransferRequestStatus.Approved:
        return 'status-approved';
      case TransferRequestStatus.PartiallyApproved:
        return 'status-partial';
      case TransferRequestStatus.RejectedBySender:
        return 'status-rejected';
      case TransferRequestStatus.Received:
        return 'status-received';
      case TransferRequestStatus.PartiallyReceived:
        return 'status-partial-received';
      case TransferRequestStatus.RejectedByReceiver:
        return 'status-rejected-receiver';
      default:
        return '';
    }
  }
}
