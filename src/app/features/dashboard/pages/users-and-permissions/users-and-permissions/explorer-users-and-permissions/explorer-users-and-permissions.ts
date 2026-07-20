import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { GroupsService } from '../services/groups-service';
import { GroupModel } from '../models/group';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SalePriceType } from '../../../../../../shared/Enums/enum-salesSalary';

@Component({
  selector: 'app-explorer-users-and-permissions',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-users-and-permissions.html',
  styleUrl: './explorer-users-and-permissions.scss',
})
export class ExplorerUsersAndPermissions implements OnInit {
  private _groupsService = inject(GroupsService);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);
  private _sharedStateServices = inject(SharedStateServices);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه صلاحيات جديدة',
    action: '/users-and-permissions/users-and-permissions/add',
  };

  filteringData = [
    {
      label: 'اسم المجموعة',
      key: 'name',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-6',
      placeholder: 'اسم المجموعة',
    },
    {
      label: 'الفرع',
      key: 'branch',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-6',
      placeholder: 'الفرع',
    },
  ];

  first = 0;
  rows = 10;
  itemsTable: GroupModel[] = [];
  totalRecords = 0;
  showDeleteDialog = false;
  idDelete = 0;

  private salePriceTypes = [
    { id: SalePriceType.RetailSalePrice, name: 'سعر بيع التجزئة' },
    { id: SalePriceType.WholesalePrice, name: 'سعر بيع الجملة' },
    { id: SalePriceType.SuperWholesalePrice, name: 'سعر بيع جملة الجملة' },
    { id: SalePriceType.PurchasePrice, name: 'سعر الشراء' },
    { id: SalePriceType.BelowPurchasePrice, name: 'أقل من سعر الشراء' },
  ];

  ngOnInit(): void {
    this.getAllGroups();
  }

  getAllGroups(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    this._groupsService
      .getAllSendInQuery(page, this.rows)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.itemsTable = res?.data?.rows ?? [];
          this.totalRecords = res?.data?.paginationInfo?.totalRowsCount ?? 0;
          this._cdr.detectChanges();
        },
      });
  }

  onPageChange(event: any): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.getAllGroups();
  }

  onSearch(value: any): void {
    if (!value?.key || !value?.value) return;

    let enumKey: SearchableColumnEnum;

    switch (value.key) {
      case 'name':
        enumKey = SearchableColumnEnum.Name;
        break;
      case 'branch':
        enumKey = SearchableColumnEnum.NameAr;
        break;
      default:
        return;
    }

    const payload = buildSearchPayload(value.value, this.rows, enumKey);

    this._groupsService
      .searchWithoutSkipLoader(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.itemsTable = [...(res?.data?.rows ?? [])];
          this.totalRecords = res?.data?.paginationInfo?.totalRowsCount ?? this.itemsTable.length;
          this._cdr.detectChanges();
        },
      });
  }

  editGroup(id: number): void {
    this._sharedStateServices.setSelectedId(id);
    this._router.navigate(['/users-and-permissions/users-and-permissions/add']);
  }

  deleteGroup(id: number): void {
    this.showDeleteDialog = true;
    this.idDelete = id;
  }

  deleteDialog(): void {
    if (this.idDelete <= 0) return;

    this._groupsService
      .delete(this.idDelete)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.idDelete = 0;
          this.getAllGroups();
        },
      });
  }

  getSalePriceTypeName(type?: number): string {
    return this.salePriceTypes.find((item) => item.id === type)?.name ?? '';
  }
}
