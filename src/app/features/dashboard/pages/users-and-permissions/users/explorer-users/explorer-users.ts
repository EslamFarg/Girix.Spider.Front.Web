import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UsersService } from '../services/users-service';
import { UsersStateService } from '../services/users-state.service';
import { UserModel } from '../models/user';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-explorer-users',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog,NgClass],
  templateUrl: './explorer-users.html',
  styleUrl: './explorer-users.scss',
})
export class ExplorerUsers implements OnInit {
  private _usersService = inject(UsersService);
  private _usersStateService = inject(UsersStateService);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه مستخدم جديد',
    action: '/users-and-permissions/users/add',
  };

  filteringData = [
    {
      label: 'اسم المستخدم',
      key: 'userName',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-6',
      placeholder: 'اسم المستخدم',
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
  itemsTable: UserModel[] = [];
  totalRecords = 0;
  showDeleteDialog = false;
  idDelete: string | number | null = null;

  ngOnInit(): void {
    this.getAllUsers();
  }

  getAllUsers(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    this._usersService
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
    this.getAllUsers();
  }

  onSearch(value: any): void {
    if (!value?.key || !value?.value) return;

    let enumKey: SearchableColumnEnum;

    switch (value.key) {
      case 'userName':
        enumKey = SearchableColumnEnum.UserName;
        break;
      case 'phone':
        enumKey = SearchableColumnEnum.Phone;
        break;
      case 'branch':
        enumKey = SearchableColumnEnum.BranchName;
        break;
      default:
        return;
    }

    const payload = buildSearchPayload(value.value, this.rows, enumKey);

    this._usersService
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

  editUser(id: string | number): void {
    this._usersStateService.setSelectedUserId(id);
    this._router.navigate(['/users-and-permissions/users/add'], {
      queryParams: { id: String(id) },
    });
  }

  deleteUser(id: string | number): void {
    this.showDeleteDialog = true;
    this.idDelete = id;
  }

  deleteDialog(): void {
    if (this.idDelete == null || this.idDelete === '') return;

    this._usersService
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
          this.idDelete = null;
          this.getAllUsers();
        },
      });
  }

  // getUserStatus(item: UserModel): string {
  //   return item.isActive ? 'نشط' : 'غير نشط';
  // }

  getUserStatus(item: any): any {
    return item.isActive ? 'نشط' : 'غير نشط';
  }
  
  getUserStatusClass(item: any): any {
    return item.isActive
      ? 'bg-green-100 text-green-700 border border-green-200'
      : 'bg-red-100 text-red-700 border border-red-200';
  }
}
