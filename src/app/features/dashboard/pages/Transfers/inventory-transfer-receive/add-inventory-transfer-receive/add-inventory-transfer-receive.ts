import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import * as CryptoJS from 'crypto-js';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { APP_CONSTANTS } from '../../../../../../shared/constants/app.constants';
import { TransferRequestService } from '../../inventory-transfer-order/services/transfer-request-service';
import {
  RejectTransferReceiptPayload,
  TransferReceiveLineItem,
  TransferReceiveReview,
} from '../models/transfer-receive';
import { EmptyTable } from '../../../../../../shared/ui/empty-table/empty-table';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';

@Component({
  selector: 'app-add-inventory-transfer-receive',
  imports: [
    PageHeader,
    ReactiveFormsModule,
    Dialog,
    EmptyTable,
    SharedConfirmDialog,
  ],
  templateUrl: './add-inventory-transfer-receive.html',
  styleUrl: './add-inventory-transfer-receive.scss',
})
export class AddInventoryTransferReceive implements OnInit {
  private readonly _transferServices = inject(TransferRequestService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _sharedStateService = inject(SharedStateServices);

  actions: { label: string; type?: string; action: string }[] = [];
  requestSearchControl = new FormControl('');
  transferRequestId = 0;
  settingsUser: any;
  visible = false;
  showRejectDialog = false;

  transferView: any = {
    toWarehouseName: '-',
    employeeName: '-',
    fromWarehouseName: '-',
    requestDate: '-',
    notes: '',
    printCount: 0,
    editCount: 0,
  };

  itemsTable: TransferReceiveLineItem[] = [];

  explorerBtn = {
    label: 'مستكشف استلام التحويل المخزني ',
    link: '/inventory-transfer-receive/explorer',
  };

  ngOnInit(): void {
    this.decryptApplicationSettings();
    this.loadTransferFromExplorer();
  }

  private loadTransferFromExplorer(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) {
      return;
    }

    this.loadTransferReview(id, '');
  }

  decryptApplicationSettings(): void {
    const encrypted = localStorage.getItem('applicationSettings');
    if (!encrypted) {
      return;
    }

    const secret = APP_CONSTANTS.secretKey;
    const bytes = CryptoJS.AES.decrypt(encrypted, secret);
    const settings = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    this.settingsUser = settings.user;
  }

  searchTransferRequest(event?: Event): void {
    const code = event
      ? (event.target as HTMLInputElement).value?.trim()
      : this.requestSearchControl.value?.trim();

    if (!code) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب ادخال رقم الطلب',
      });
      return;
    }

    this._transferServices
      .search({
        code,
        pagination: {
          pageIndex: 1,
          pageSize: 1,
        },
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const row = res.data?.rows?.[0];

          if (!row?.id) {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على طلب بهذا الرقم',
            });
            return;
          }

          this.loadTransferReview(row.id, code);
        },
      });
  }

  private loadTransferReview(id: number, code: string): void {
    this._transferServices
      .getReceiverReview(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.fillViewData(res.data, code);
        },
        error: () => {
          this._transferServices
            .getById(id)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: (detailsRes: any) => {
                this.fillViewData(detailsRes.data, code);
              },
            });
        },
      });
  }

  private fillViewData(data: TransferReceiveReview, code: string): void {
    this.transferRequestId = data.transferRequestId ?? data.id ?? 0;
    this.requestSearchControl.setValue(
      String(data.code ?? data.requestNo ?? code),
      { emitEvent: false },
    );

    this.transferView = {
      fromWarehouseName: data.fromWarehouseName ?? '-',
      toWarehouseName: data.toWarehouseName ?? '-',
      requestDate: this.formatDate(data.date ?? data.requestDate),
      employeeName: data.employeeName ?? '-',
      notes: data.notes ?? '',
      printCount: data.printCount ?? 0,
      editCount: data.editCount ?? 0,
    };

    const lines = data.lines ?? data.transferRequestLines ?? [];
    this.itemsTable = lines.map((line: any) => ({
      productCode: line.productCode ?? line.code ?? '-',
      productName: line.productName ?? line.itemName ?? '-',
      requestedUnitName: line.requestedUnitName ?? line.unitName ?? '-',
      requestedQuantity: line.requestedQuantity ?? 0,
      transferredQuantity:
        line.transferredQuantity ??
        line.approvedQuantity ??
        line.dispensedQuantity ??
        0,
      transferredUnitName:
        line.transferredUnitName ??
        line.approvedUnitName ??
        line.unitName ??
        '-',
    }));

    this.actions = [
      { label: 'قبول', type: 'primary', action: 'save' },
      { label: 'رفض', action: 'delete' },
      { label: 'طباعه', action: 'print' },
    ];
  }

  getTotalRequested(): number {
    return this.itemsTable.reduce(
      (sum, item) => sum + Number(item.requestedQuantity ?? 0),
      0,
    );
  }

  getTotalTransferred(): number {
    return this.itemsTable.reduce(
      (sum, item) => sum + Number(item.transferredQuantity ?? 0),
      0,
    );
  }

  handleAction(action: string): void {
    if (!this.transferRequestId) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يجب البحث عن طلب أولاً',
      });
      return;
    }

    switch (action) {
      case 'save':
        this.save();
        break;
      case 'delete':
        this.delete();
        break;
      case 'print':
        this.print();
        break;
    }
  }

  showDialog(): void {
    this.visible = true;
  }

  save(): void {
    if (!this.itemsTable.length) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'لا توجد أصناف لاستلام الطلب',
      });
      return;
    }

    this._transferServices
      .receiverConfirm(this.transferRequestId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم استلام الطلب بنجاح',
          });
          this.reloadCurrentTransfer();
        },
      });
  }

  delete(): void {
    this.showRejectDialog = true;
  }

  rejectDialog(): void {
    const payload: RejectTransferReceiptPayload = {
      id: this.transferRequestId,
      rejectionReasons: ['رفض الاستلام'],
      otherReason: 'رفض الاستلام',
    };

    this._transferServices
      .receiverReject(this.transferRequestId, payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم رفض استلام الطلب بنجاح',
          });
          this.showRejectDialog = false;
          this.clearForm();
        },
      });
  }

  print(): void {
    console.log('Print action for transfer:', this.transferRequestId);
  }

  private reloadCurrentTransfer(): void {
    const code = this.requestSearchControl.value?.trim();
    if (!code) {
      return;
    }

    this.loadTransferReview(this.transferRequestId, code);
  }

  private clearForm(): void {
    this.transferRequestId = 0;
    this.actions = [];
    this.itemsTable = [];
    this.requestSearchControl.reset();
    this.transferView = {
      toWarehouseName: '-',
      employeeName: '-',
      fromWarehouseName: '-',
      requestDate: '-',
      notes: '',
      printCount: 0,
      editCount: 0,
    };
  }

  private formatDate(value?: string): string {
    if (!value) {
      return '-';
    }
    return value.split('T')[0];
  }
}
