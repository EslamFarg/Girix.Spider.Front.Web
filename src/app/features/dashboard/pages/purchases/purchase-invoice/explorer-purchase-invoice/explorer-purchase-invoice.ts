import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { Paginator } from 'primeng/paginator';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { Purchase } from '../services/purchase';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { PaymentMethod } from '../../../../../../shared/Enums/invoice.enum';
import { PurchaseListItem, ApiResponse, PaginatedRows } from '../models/purchase-invoice';

@Component({
  selector: 'app-explorer-purchase-invoice',
  imports: [PageHeaderSearch, Paginator, SharedConfirmDialog],
  templateUrl: './explorer-purchase-invoice.html',
  styleUrl: './explorer-purchase-invoice.scss',
})
export class ExplorerPurchaseInvoice {
  _purchaseServices = inject(Purchase);
  _destroyRef = inject(DestroyRef);
  _messageServices = inject(MessageService);
  _sharedStateServices = inject(SharedStateServices);
  _router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه فاتورة شراء جديد',
    action: '/purchase-invoice/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  showDeleteDialog = false;
  idDelete = 0;

  itemsTable: PurchaseListItem[] = [];

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
      key: 'InvoiceReference',
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
    {
      label: 'المورد',
      key: 'SupplayerNameAr',
      type: 'text',
      value: '',
      class: 'col-span-12',
      placeholder: 'المورد',
    },
  ];

  ngOnInit(): void {
    this.getAllData();
  }

  getAllData(): void {
    this._purchaseServices
      .getAllPurchases(this.first, this.rows)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res) => {
        this.itemsTable = res.data.rows;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
      });
  }

  getTotalQuantity(item: PurchaseListItem): number {
    if (item.totalQuantity != null) {
      return item.totalQuantity;
    }
    return (item.purchaseDetails ?? []).reduce(
      (sum, detail) => sum + Number(detail.quantity || 0),
      0,
    );
  }

  getPaymentMethodLabel(method: PaymentMethod | string | undefined): string {
    if (method == null || method === '') {
      return '';
    }
    const value = typeof method === 'string' ? Number(method) : method;
    switch (value) {
      case PaymentMethod.Cash:
        return 'كاش';
      case PaymentMethod.NetworkPayment:
        return 'شبكة';
      case PaymentMethod.BankTransfer:
        return 'تحويل بنكي';
      case PaymentMethod.PayrollAccount:
        return 'حساب الرواتب';
      default:
        return String(method);
    }
  }

  onEditData(id: number): void {
    this._sharedStateServices.setSelectedId(id);
    this._router.navigate(['/purchase-invoice/add']);
  }

  delete(id: number): void {
    this.showDeleteDialog = true;
    this.idDelete = id;
  }

  deleteDialog(): void {
    this._purchaseServices
      .deletePurchase(this.idDelete)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.getAllData();
        },
      });
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.getAllData();
  }

  onSearch(value: { key: string; value: string }): void {
    this.first = 0;

    if (!value.key || !value.value) {
      return;
    }

    let enumKey: SearchableColumnEnum;

    switch (value.key) {
      case 'invoiceNumber':
        enumKey = SearchableColumnEnum.InvoiceNumber;
        break;
      case 'InvoiceReference':
        enumKey = SearchableColumnEnum.InvoiceReference;
        break;
      case 'phoneNumber':
        enumKey = SearchableColumnEnum.Phone;
        break;
      case 'SupplayerNameAr':
        enumKey = SearchableColumnEnum.SupplayerNameAr;
        break;
      default:
        return;
    }

    const payload = buildSearchPayload(value.value, this.rows, enumKey);

    this._purchaseServices
      .searchPurchases(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res) => {
        this.itemsTable = res.data.rows;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
        this.cdr.detectChanges();
      });
  }
}
