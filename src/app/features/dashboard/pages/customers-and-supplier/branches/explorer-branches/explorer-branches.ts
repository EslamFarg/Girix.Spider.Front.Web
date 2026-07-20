import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { BranchService } from '../services/branch-service';
import { BranchModel } from '../models/branch';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';

@Component({
  selector: 'app-explorer-branches',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-branches.html',
  styleUrl: './explorer-branches.scss',
})
export class ExplorerBranches implements OnInit {
  private _branchService = inject(BranchService);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);
  private _sharedStateServices = inject(SharedStateServices);
  private _router = inject(Router);
  private _cdr = inject(ChangeDetectorRef);

  dataAddButton = {
    label: 'اضافه فرع جديد',
    action: '/branches/add',
  };

  filteringData = [
    {
      label: 'كود الفرع',
      key: 'code',
      type: 'text',
      value: '',
      class: 'col-span-12 md:col-span-12',
      placeholder: 'كود الفرع',
    },
    // {
    //   label: 'اسم الفرع',
    //   key: 'name',
    //   type: 'text',
    //   value: '',
    //   class: 'col-span-12 md:col-span-4',
    //   placeholder: 'اسم الفرع',
    // },
    // {
    //   label: 'رقم الجوال',
    //   key: 'phone',
    //   type: 'text',
    //   value: '',
    //   class: 'col-span-12 md:col-span-4',
    //   placeholder: 'رقم الجوال',
    // },
  ];

  first = 0;
  rows = 10;
  itemsTable: BranchModel[] = [];
  totalRecords = 0;
  showDeleteDialog = false;
  idDelete = 0;

  ngOnInit(): void {
    this.getAllBranches();
  }

  getAllBranches(): void {
    const page = Math.floor(this.first / this.rows) + 1;

    this._branchService
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
    this.getAllBranches();
  }

  onSearch(value: any): void {
    if (!value?.key || !value?.value) return;

    let enumKey: SearchableColumnEnum;

    switch (value.key) {
      case 'code':
        enumKey = SearchableColumnEnum.Code;
        break;
      case 'name':
        enumKey = SearchableColumnEnum.Name;
        break;
      case 'phone':
        enumKey = SearchableColumnEnum.Phone;
        break;
      default:
        return;
    }

    const payload = buildSearchPayload(value.value, this.rows, enumKey);

    this._branchService
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

  editBranch(id: number): void {
    this._sharedStateServices.setSelectedId(id);
    this._router.navigate(['/branches/add']);
  }

  deleteBranch(id: number): void {
    this.showDeleteDialog = true;
    this.idDelete = id;
  }

  deleteDialog(): void {
    if (this.idDelete <= 0) return;

    this._branchService
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
          this.getAllBranches();
        },
      });
  }

  getBranchName(item: BranchModel): string {
    return item.name ?? item.nameAr ?? item.nameEn ?? '';
  }

  getCodeNumber(item: BranchModel): string {
    return String(
      item.id ??
        item.id ??
        (item as any).accountNo ??
        (item as any).accountId ??
        ''
    );
  }
}
