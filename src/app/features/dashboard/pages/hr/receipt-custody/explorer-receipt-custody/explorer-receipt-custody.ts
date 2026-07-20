import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { CustodyReceiptModel } from '../models/custody-receipt';
import { CustodyReceiptService } from '../services/custody-receipt-service';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';

@Component({
  selector: 'app-explorer-receipt-custody',
  imports: [Paginator, SharedConfirmDialog, RouterLink, PageHeaderSearch],
  templateUrl: './explorer-receipt-custody.html',
  styleUrl: './explorer-receipt-custody.scss',
})
export class ExplorerReceiptCustody implements OnInit {
  private readonly _custodyReceiptService = inject(CustodyReceiptService);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _messageService = inject(MessageService);
  private readonly _router = inject(Router);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافة استلام عهدة',
    action: '/hr/receipt-custody/add',
  };

  first = 0;
  rows = 10;
  totalRecords = 0;
  itemsTable: CustodyReceiptModel[] = [];
  idDelete = 0;
  showDeleteDialog = false;
  activeSearchFilter: { column: number; value: string } | null = null;

  filteringData = [
    {
      label: 'رقم الموظف',
      key: 'employeeNumber',
      type: 'text',
      value: '',
      class: 'col-span-6',
      placeholder: 'رقم الموظف',
    },
    {
      label: 'اسم الموظف',
      key: 'employeeName',
      type: 'text',
      value: '',
      class: 'col-span-6',
      placeholder: 'اسم الموظف',
    },
  ];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    const request$ = this.activeSearchFilter
      ? this._custodyReceiptService.searchCustodyReceipt({
          filter: this.activeSearchFilter,
          pagination: {
            pageIndex: page,
            pageSize: this.rows,
          },
        })
      : this._custodyReceiptService.getAllCustodyReceipt(page, this.rows);

    request$
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

  updateReceipt(id: number): void {
    this._sharedStateService.setSelectedId(id);
    this._router.navigate(['/hr/receipt-custody/add']);
  }

  deleteReceipt(id: number): void {
    this.idDelete = id;
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._custodyReceiptService
      .deleteCustodyReceipt(this.idDelete)
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

  search(data:any): void {
    this.first = 0;

    console.log(data)

    if (!data) {
      this.activeSearchFilter = null;
      this.loadData();
      return;
    }

    let column: SearchableColumnEnum;

    switch (data.key) {
      case 'employeeNumber':
        column = SearchableColumnEnum.EmployeeNumber;
        break;
      case 'employeeName':
        column = SearchableColumnEnum.Name;
        break;
      default:
        return;
    }

    this.activeSearchFilter = {
      column,
      value: data.value.trim(),
    };

    this.loadData();
  }

  getEmployeeId(item: CustodyReceiptModel): string {
    if (item.employeeNumber) {
      return String(item.employeeNumber);
    }
    return item.employeeId != null ? String(item.employeeId) : '-';
  }

  getEmployeeName(item: CustodyReceiptModel): string {
    return item.employeeName ?? item.name ?? '-';
  }

  getPhoneNumber(item: CustodyReceiptModel): string {
    return item.employeePhoneNum ?? '-';
  }

  getDepartmentName(item: CustodyReceiptModel): string {
    return item.departmentName ?? '-';
  }

  getNationality(item: CustodyReceiptModel): string {
    return item.nationality ?? '-';
  }

  getBaseSalary(item: CustodyReceiptModel): string {
    const salary = item.baseSalary ?? item.salary;
    return salary != null ? String(salary) : '-';
  }

  getAdditionType(item: CustodyReceiptModel): string {
    return item.additionType ?? item.custodyName ?? item.custodyTypeName ?? '-';
  }

  getAmount(item: CustodyReceiptModel): string {
    return item.amount != null ? String(item.amount) : '-';
  }
}
