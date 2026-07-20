import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { GroupsService } from '../services/groups-service';
import { BranchService } from '../../../customers-and-supplier/branches/services/branch-service';
import { SalePriceType } from '../../../../../../shared/Enums/enum-salesSalary';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { GroupModel } from '../models/group';
import { userNameValidation } from '../../../../../../shared/validations/user-name';

interface LookupItem {
  id: number;
  name: string;
}

@Component({
  selector: 'app-add-users-and-permissions',
  imports: [
    NgSelectComponent,
    RouterLink,
    ReactiveFormsModule,
    FormError,
    NgClass,
    SharedConfirmDialog,
  ],
  templateUrl: './add-users-and-permissions.html',
  styleUrl: './add-users-and-permissions.scss',
})
export class AddUsersAndPermissions extends FormComponentBase implements OnInit, OnDestroy {
  private _fb = inject(FormBuilder);
  private _groupsService = inject(GroupsService);
  private _branchService = inject(BranchService);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);

  groupForm = this._fb.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        userNameValidation(),
      ],
    ],
    branchId: [null as number | null, [Validators.required]],
    salePriceType: [null, [Validators.required]] as any,
    showWholesalePrice: [true],
    showProfitPrice: [true],
    showSuperWholesalePrice: [true],
    showAverageCostPrice: [true],
    showPurchasePrice: [true],
    allowSellingBelowAvailable: [true],
  });

  groupSearchControl = new FormControl('');
  branchesList: LookupItem[] = [];
  branchesLoading = false;
  showDeleteDialog = false;
  pageSize = 10;

  salePriceTypes = [
    { id: SalePriceType.RetailSalePrice, name: 'سعر بيع التجزئة' },
    { id: SalePriceType.WholesalePrice, name: 'سعر بيع الجملة' },
    { id: SalePriceType.SuperWholesalePrice, name: 'سعر بيع جملة الجملة' },
    { id: SalePriceType.PurchasePrice, name: 'سعر الشراء' },
    { id: SalePriceType.BelowPurchasePrice, name: 'أقل من سعر الشراء' },
  ];

  ngOnInit(): void {
    this.refreshActions();
    this.loadBranches();
    this.loadGroup();
  }

  loadGroup(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) return;

    this._groupsService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.fillForm(res.data);
          this.changeButtonState(res.data.id, true);
          this.refreshActions();
        },
      });
  }

  searchGroupByName(): void {
    const query = this.groupSearchControl.value?.trim();
    if (!query) {
      this._messageServices.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يرجى إدخال اسم المجموعة',
      });
      return;
    }

    const payload = buildSearchPayload(query, this.pageSize, SearchableColumnEnum.Name);

    this._groupsService
      .search(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = res?.data?.rows ?? [];
          if (!rows.length) {
            this._messageServices.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على المجموعة',
            });
            return;
          }

          const groupId = rows[0].id;
          this._groupsService
            .getByIdInQuery(groupId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: (groupRes: any) => {
                this.fillForm(groupRes.data);
                this.changeButtonState(groupRes.data.id, true);
                this.refreshActions();
                this.groupSearchControl.setValue('');
              },
            });
        },
      });
  }

  save(): void {
    if (this.groupForm.invalid) {
      this.groupForm.markAllAsTouched();
      return;
    }

    const payload = this.groupForm.getRawValue();

    if (!this.isEditMode) {
      this._groupsService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            // this.loadGroupById(res.data);
            this.changeButtonState(res.data, true);
            this.refreshActions();
          },
        });
      return;
    }

    this._groupsService
      .updateWithOutPathParameter({
        id: this.idUpdate,
        ...payload,
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
          // this.loadGroupById(this.idUpdate);
        },
      });
  }

  reset(): void {
    this.groupForm.reset({
      salePriceType: null,
      showWholesalePrice: true,
      showProfitPrice: true,
      showSuperWholesalePrice: true,
      showAverageCostPrice: true,
      showPurchasePrice: true,
      allowSellingBelowAvailable: true,
    });
    this.idUpdate = 0;
    this.isEditMode = false;
    this.groupSearchControl.reset();
    this._sharedStateService.clearSelectedId();
    this.refreshActions();
  }

  delete(): void {
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    if (this.idUpdate <= 0) return;

    this._groupsService
      .delete(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.reset();
        },
      });
  }

  print(): void {
    window.print();
  }

  getSalePriceTypeName(type?: number): string {
    return this.salePriceTypes.find((item) => item.id === type)?.name ?? '';
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  private loadGroupById(id: number): void {
    this._groupsService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.fillForm(res.data);
          this.changeButtonState(res.data.id, true);
          this.refreshActions();
        },
      });
  }

  private fillForm(data: GroupModel): void {
    this.groupForm.patchValue({
      name: data.name ?? '',
      branchId: data.branchId ?? null,
      salePriceType: data.salePriceType ?? null as number | null,
      showWholesalePrice: data.showWholesalePrice ?? false,
      showProfitPrice: data.showProfitPrice ?? false,
      showSuperWholesalePrice: data.showSuperWholesalePrice ?? false,
      showAverageCostPrice: data.showAverageCostPrice ?? false,
      showPurchasePrice: data.showPurchasePrice ?? false,
      allowSellingBelowAvailable: data.allowSellingBelowAvailable ?? false,
    });
  }

  private loadBranches(): void {
    this.branchesLoading = true;
    this._branchService
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.branchesList = (res?.data?.rows ?? []).map((item: any) => ({
            id: item.id,
            name: item.name ?? item.nameAr ?? item.nameEn ?? String(item.id),
          }));
          this.branchesLoading = false;
        },
        error: () => {
          this.branchesLoading = false;
        },
      });
  }
}
