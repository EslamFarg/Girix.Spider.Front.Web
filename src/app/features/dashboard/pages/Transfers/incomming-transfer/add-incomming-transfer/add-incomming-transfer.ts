import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import * as CryptoJS from 'crypto-js';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { APP_CONSTANTS } from '../../../../../../shared/constants/app.constants';
import { TransferRequestService } from '../../inventory-transfer-order/services/transfer-request-service';
import {
  IncomingTransferLineItem,
  IncomingTransferReview,
  IncomingTransferUnitOption,
  SenderApprovePayload,
} from '../models/incoming-transfer';
import { EmptyTable } from '../../../../../../shared/ui/empty-table/empty-table';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';

@Component({
  selector: 'app-add-incomming-transfer',
  imports: [
    PageHeader,
    ReactiveFormsModule,
    FormsModule,
    Dialog,
    EmptyTable,
    NgSelectComponent,
    SharedConfirmDialog,
  ],
  templateUrl: './add-incomming-transfer.html',
  styleUrl: './add-incomming-transfer.scss',
})
export class AddIncommingTransfer implements OnInit {
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
    availableQuantity: '-',
    fromWarehouseName: '-',
    requestDate: '-',
    notes: '',
    printCount: 0,
    editCount: 0,
  };

  itemsTable: IncomingTransferLineItem[] = [];
  selectedPopupLine: IncomingTransferLineItem | null = null;

  explorerBtn = {
    label: 'مستكشف تحويل وارد ',
    link: '/incomming-transfer/explorer',
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
      .getSenderReview(id)
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

  private fillViewData(data: IncomingTransferReview, code: string): void {
    // console.log('datasss', data);
    this.transferRequestId = data.transferRequestId;
    this.requestSearchControl.setValue(
      String(data.code ?? data.requestNo ?? code),
      { emitEvent: false },
    );

    this.transferView = {
      availableQuantity: String(
        data.availableQuantity ?? data.totalAvailableQuantity ?? '-',
      ),
      fromWarehouseName: data.fromWarehouseName ?? '-',
      toWarehouseName: data.toWarehouseName ?? '-',
      requestDate: this.formatDate(data.date ?? data.requestDate),
      employeeName: data?.employeeName ?? '-',
      notes: data.notes ?? '',
      printCount: data.printCount ?? 0,
      editCount: data.editCount ?? 0,
    };

    const lines = data.lines ?? data.transferRequestLines ?? [];
    this.itemsTable = lines.map((line: any) => {
      const availableUnits = this.mapAvailableUnits(line);
      const defaultProductCardId =
        line.productCardId ??
        line.transferredProductCardId ??
        availableUnits[0]?.id ??
        null;

      return {
        lineId: line.id ?? line.lineId,
        productCardId: defaultProductCardId,
        productCode: line.productCode ?? line.code ?? '-',
        productName: line.productName ?? line.itemName ?? '-',
        requestedUnitName: line.requestedUnitName ?? line.unitName ?? '-',
        requestedQuantity: line.requestedQuantity ?? 0,
        transferredQuantity:
          line.transferredQuantity ??
          line.approvedQuantity ??
          line.dispensedQuantity ??
          line.requestedQuantity ??
          0,
        transferredUnitName:
          line.transferredUnitName ??
          line.transferUnitName ??
          line.approvedUnitName ??
          line.unitName ??
          '-',
        availableQuantity: line.availableQuantity ?? 0,
        suggestedTransferQuantity: line.suggestedTransferQuantity ?? 0,
        reservedForSalesQuantity: line.reservedForSalesQuantity ?? 0,
        reservedForTransfersQuantity: line.reservedForTransfersQuantity ?? 0,
        stockStatus: line.stockStatus ?? '',
        availableUnits,
      };
    });

    this.actions = [
      { label: 'قبول', type: 'primary', action: 'save' },
      { label: 'رفض', action: 'delete' },
      { label: 'طباعه', action: 'print' },
    ];
  }

  private mapAvailableUnits(line: any): IncomingTransferUnitOption[] {
    const units = line.availableUnits ?? line.units ?? [];

    return units
      .map((unit: any) => ({
        id: unit.productCardId ?? unit.id,
        name: unit.unitName ?? unit.name ?? unit.fromUnitName ?? '',
      }))
      .filter((unit: IncomingTransferUnitOption) => unit.id && unit.name);
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

  onTransferredQtyChange(index: number, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.itemsTable[index].transferredQuantity = Number.isNaN(value) ? 0 : value;
  }

  onProductCardChange(index: number, productCardId: number | null): void {
    this.itemsTable[index].productCardId = productCardId;
  }

  handleAction(action: string): void {
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

  showDialog(index: number): void {
    this.selectedPopupLine = this.itemsTable[index] ?? null;
    this.visible = true;
  }

  save(): void {

    console.log('transferRequestId', this.transferRequestId);
    if (!this.itemsTable.length) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'لا توجد أصناف لقبول الطلب',
      });
      return;
    }

    const invalidLine = this.itemsTable.find(
      (line) =>
        !line.lineId ||
        !line.productCardId ||
        line.transferredQuantity == null ||
        Number(line.transferredQuantity) <= 0,
    );

    if (invalidLine) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب تحديد الوحدة والكمية المصروفة لكل صنف',
      });
      return;
    }

    const payload: SenderApprovePayload = {
      id: this.transferRequestId,
      lines: this.itemsTable.map((line) => ({
        lineId: line.lineId as number,
        productCardId: line.productCardId as number,
        transferredQuantity: Number(line.transferredQuantity),
      })),
    };

    this._transferServices
      .senderApprove(this.transferRequestId, payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم قبول الطلب بنجاح',
          });
          this.reloadCurrentTransfer();
        },
      });
  }

  delete(): void {
    this.showRejectDialog = true;
  }

  rejectDialog(): void {
    this._transferServices
      .senderReject(this.transferRequestId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم رفض الطلب بنجاح',
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
      availableQuantity: '-',
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
