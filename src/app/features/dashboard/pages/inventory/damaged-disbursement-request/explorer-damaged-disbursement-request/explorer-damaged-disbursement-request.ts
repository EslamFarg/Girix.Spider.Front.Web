import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { DamageRequestModel } from '../models/damage-request';
import { DamageRequestsService } from '../services/damage-requests-service';

@Component({
  selector: 'app-explorer-damaged-disbursement-request',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-damaged-disbursement-request.html',
  styleUrl: './explorer-damaged-disbursement-request.scss',
})
export class ExplorerDamagedDisbursementRequest implements OnInit {
  private readonly _damageRequestsService = inject(DamageRequestsService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'طلب صرف تالف ',
    action: '/damaged-disbursement-request/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: DamageRequestModel[] = [];
  idDelete = 0;
  showDeleteDialog = false;

  filteringData = [
    {
      label: 'رقم الفاتورة',
      key: 'invoiceNumber',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-4',
      placeholder: 'رقم الفاتورة',
    },
    {
      label: 'رقم المرجع',
      key: 'returnsNumber',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-4',
      placeholder: 'رقم المرجع',
    },
    {
      label: 'رقم الجوال',
      key: 'phoneNumber',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-4',
      placeholder: 'رقم الجوال',
    },
  ];

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData(): void {
    const page = Math.floor(this.first / this.rows) + 1;
    this._damageRequestsService
      .getAllDamageRequests(page, this.rows)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.itemsTable = res.data?.rows ?? [];
          this.totalRecords = res.data?.paginationInfo?.totalRowsCount ?? 0;
        },
      });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.getAllData();
  }

  onEditData(id: number): void {
    this._sharedStateService.setSelectedId(id);
    this._router.navigate(['/damaged-disbursement-request/add']);
  }

  delete(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._damageRequestsService
      .deleteDamageRequest(this.idDelete)
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
          this.getAllData();
        },
      });
  }

  onSearch(value: { key: string; value: string }): void {
    this.first = 0;

    if (!value.key || !value.value) {
      this.getAllData();
      return;
    }

    let enumKey: SearchableColumnEnum;

    switch (value.key) {
      case 'invoiceNumber':
        enumKey = SearchableColumnEnum.InvoiceNumber;
        break;
      case 'returnsNumber':
        enumKey = SearchableColumnEnum.InvoiceReference;
        break;
      case 'phoneNumber':
        enumKey = SearchableColumnEnum.Phone;
        break;
      default:
        return;
    }

    const page = Math.floor(this.first / this.rows) + 1;
    const payload = buildSearchPayload(value.value, this.rows, enumKey);
    payload.pagination.pageIndex = page;

    this._damageRequestsService
      .searchDamageRequests(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.itemsTable = res.data?.rows ?? [];
          this.totalRecords = res.data?.paginationInfo?.totalRowsCount ?? 0;
          this._cdr.detectChanges();
        },
      });
  }

  getProofNumber(item: DamageRequestModel): string {
    const value = item.requestNo ?? item.proofNumber;
    return value != null ? String(value) : '-';
  }

  getReference(item: DamageRequestModel): string {
    return item.reference ?? item.referenceNo ?? '-';
  }

  getDate(item: DamageRequestModel): string {
    const value = item.requestDate ?? item.date;
    if (!value) {
      return '-';
    }
    return value.split('T')[0];
  }

  getStore(item: DamageRequestModel): string {
    return item.warehouseName ?? item.store ?? '-';
  }

  getEmployee(item: DamageRequestModel): string {
    return item.employeeName ?? item.employee ?? '-';
  }

  getTotal(item: DamageRequestModel): string {
    return item.total != null ? String(item.total) : '-';
  }
}
