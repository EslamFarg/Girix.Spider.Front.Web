import { Component, DestroyRef, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { UsersService } from '../services/users-service';
import { UsersStateService } from '../services/users-state.service';
import { GroupsService } from '../../users-and-permissions/services/groups-service';
import { BranchService } from '../../../customers-and-supplier/branches/services/branch-service';
import { AccountsService } from '../../../accounts-parent/accounts/services/accounts-service';
import { Customers } from '../../../customers-and-supplier/customers/services/customers';
import { SelectedAccountMethod } from '../../../../../../shared/Enums/search-enum-users';
import { UserModel } from '../models/user';
import { userNameValidation } from '../../../../../../shared/validations/user-name';
import { InventoriesServices } from '../../../products/inventories/services/inventories-services';
import { environment } from '../../../../../../../environments/environment.development';

interface LookupItem {
  id: number;
  name: string;
}

interface AccountLookupState {
  method: SelectedAccountMethod;
  items: LookupItem[];
  page: number;
  pageSize: number;
  loading: boolean;
  hasMore: boolean;
  loadedAll: boolean;
}

interface CustomerLookupState {
  items: LookupItem[];
  page: number;
  pageSize: number;
  loading: boolean;
  hasMore: boolean;
  loadedAll: boolean;
}

@Component({
  selector: 'app-add-users',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormError,
    NgClass,
    NgSelectComponent,
    SharedConfirmDialog,
  ],
  templateUrl: './add-users.html',
  styleUrl: './add-users.scss',
})
export class AddUsers extends FormComponentBase implements OnInit, OnDestroy {
  @ViewChild('userImageInput') userImageInput!: ElementRef<HTMLInputElement>;

  private _fb = inject(FormBuilder);
  private _usersService = inject(UsersService);
  private _usersStateService = inject(UsersStateService);
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _groupsService = inject(GroupsService);
  private _branchService = inject(BranchService);
  private _accountsService = inject(AccountsService);
  private _customersService = inject(Customers);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);
  private _warehouseService = inject(InventoriesServices);

  userForm = this._fb.group({
    userName: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        userNameValidation(),
      ],
    ],
    password: ['', [Validators.minLength(6), Validators.maxLength(20)]],
    branchId: [null as number | null, [Validators.required]],
    groupId: [null as number | null, [Validators.required]],
    defaultCashBoxAccountId: [null as number | null],
    defaultBankAccountId: [null as number | null],
    defaultPurchaseCashBoxAccountId: [null as number | null],
    defaultWarehouseId: [null as number | null],
    purchaseWarehouseId: [null as number | null],
    reservedWarehouseId: [null as number | null],
    customerAccountId: [null as number | null],
    isActive: [true],
    notes: ['', [Validators.maxLength(500)]],
  });

  branchesList: LookupItem[] = [];
  groupsList: LookupItem[] = [];
  branchesLoading = false;
  groupsLoading = false;

  cashLookup = this.createAccountLookupState(SelectedAccountMethod.Cash);
  bankLookup = this.createAccountLookupState(SelectedAccountMethod.BankTransfer);
  // warehouseLookup = this.createAccountLookupState(SelectedAccountMethod.Warehouse);
  warehouseList = [];
  customersLookup: CustomerLookupState = {
    items: [],
    page: 1,
    pageSize: 50,
    loading: false,
    hasMore: true,
    loadedAll: false,
  };

  userStatusOptions = [
    { id: true, name: 'نشط' },
    { id: false, name: 'غير نشط' },
  ];

  profileImageSelected: File | null = null;
  imagePreviewProfile: string | null = null;
  showDeleteDialog = false;
  isShowPassword = false;
  currentUserId: string | number | null = null;

  ngOnInit(): void {
    this.refreshActions();
    this.syncPasswordValidators();
    this.loadBranches();
    this.loadGroups();
    this.loadAllAccounts(this.cashLookup);
    this.loadAllAccounts(this.bankLookup);
    // this.loadAllAccounts(this.warehouseLookup);
    this.loadAllWarehouses();
    this.loadAllCustomers();

    this._route.queryParamMap
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((params) => {
        const queryId = params.get('id');
        if (queryId) {
          this.loadUserById(queryId);
          return;
        }

        const stateId = this._usersStateService.selectedUserId$();
        if (stateId != null && stateId !== '') {
          this.loadUserById(stateId);
        }
      });
  }

  togglePasswordVisibility(): void {
    this.isShowPassword = !this.isShowPassword;
  }


  loadAllWarehouses(): void {
    this._warehouseService.getAllSendInQuery(0, 0).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next: (res: any) => {
        console.log(res);
        this.warehouseList = res.data.rows;
      },
    });
  }

  save(): void {
    this.syncPasswordValidators();

    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = this.buildUserFormData();

    if (!this.isEditMode) {
      const password = this.userForm.getRawValue().password?.trim();
      if (password) {
        formData.append('password', password);
      }

      this._usersService
        .create(formData)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            const createdId = this.resolveUserId(res?.data);
            if (createdId != null) {
              this.loadUserById(createdId);
            }
          },
        });
      return;
    }

    if (this.currentUserId == null || this.currentUserId === '') {
      this._messageServices.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'معرف المستخدم غير موجود',
      });
      return;
    }

    formData.append('id', String(this.currentUserId));

    const password = this.userForm.getRawValue().password?.trim();
    if (password) {
      formData.append('password', password);
    }

    this._usersService
      .updateWithOutPathParameter(formData)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
          this.loadUserById(this.currentUserId!);
        },
      });
  }

  reset(): void {
    this.userForm.reset({ isActive: true });
    this.currentUserId = null;
    this.idUpdate = 0;
    this.isEditMode = false;
    this.isShowPassword = false;
    this.profileImageSelected = null;
    this.imagePreviewProfile = null;
    this._usersStateService.clearSelectedUserId();
    this._router.navigate(['/users-and-permissions/users/add'], { replaceUrl: true });
    this.refreshActions();
    this.syncPasswordValidators();
  }

  delete(): void {
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    if (this.currentUserId == null || this.currentUserId === '') return;

    this._usersService
      .delete(this.currentUserId)
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

  loadMoreCashAccounts(): void {
    this.loadMoreAccounts(this.cashLookup);
  }

  loadMoreBankAccounts(): void {
    this.loadMoreAccounts(this.bankLookup);
  }

  // loadMoreWarehouseAccounts(): void {
  //   this.loadMoreAccounts(this.warehouseLookup);
  // }

  loadMoreCustomers(): void {
    this.loadMoreCustomersPage();
  }

  triggerImageUpload(): void {
    this.userImageInput?.nativeElement?.click();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) return;

    if (this.imagePreviewProfile?.startsWith('blob:')) {
      URL.revokeObjectURL(this.imagePreviewProfile);
    }

    this.profileImageSelected = file;
    this.imagePreviewProfile = URL.createObjectURL(file);
  }

  previewUserImage(): void {
    if (this.imagePreviewProfile) {
      window.open(this.imagePreviewProfile, '_blank');
    }
  }

  ngOnDestroy(): void {
    this._usersStateService.clearSelectedUserId();
  }

  private loadUserById(id: string | number): void {
    this._usersService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const user = res?.data;
          if (!user) return;

          this.fillForm(user);
          this.setEditState(this.resolveUserId(user) ?? id);
        },
      });
  }

  private setEditState(id: string | number): void {
    this.currentUserId = id;
    this._usersStateService.setSelectedUserId(id);
    super.changeButtonState(1, true);
    this.syncPasswordValidators();
    this.refreshActions();
  }

  private resolveUserId(data: UserModel | string | number | null | undefined): string | number | null {
    if (data == null || data === '') return null;
    if (typeof data === 'object') return data.id ?? null;
    return data;
  }

  private fillForm(data: UserModel): void {
    this.userForm.patchValue({
      userName: data.userName ?? '',
      password: '',
      branchId: this.toNumber(data.branchId),
      groupId: this.toNumber(data.groupId),
      defaultCashBoxAccountId: this.toNumber(data.defaultCashBoxAccountId),
      defaultBankAccountId: this.toNumber(data.defaultBankAccountId),
      defaultPurchaseCashBoxAccountId: this.toNumber(data.defaultPurchaseCashBoxAccountId),
      defaultWarehouseId: this.toNumber(data.defaultWarehouseId),
      purchaseWarehouseId: this.toNumber(data.purchaseWarehouseId),
      reservedWarehouseId: this.toNumber(data.reservedWarehouseId),
      customerAccountId: this.toNumber(data.customerAccountId),
      isActive: data.isActive ?? true,
      notes: data.notes ?? '',
    });

    this.ensureAccountOption(
      this.cashLookup,
      data.defaultCashBoxAccountId,
      data.defaultCashBoxAccountName
    );
    this.ensureAccountOption(
      this.bankLookup,
      data.defaultBankAccountId,
      data.defaultBankAccountName
    );
    this.ensureAccountOption(
      this.cashLookup,
      data.defaultPurchaseCashBoxAccountId,
      data.defaultPurchaseCashBoxAccountName
    );
    // this.ensureAccountOption(
    //   // this.warehouseLookup,
    //   data.defaultWarehouseId,
    //   data.defaultWarehouseName
    // );
    // this.ensureAccountOption(
    //   // this.warehouseLookup,
    //   data.purchaseWarehouseId,
    //   data.purchaseWarehouseName
    // );
    // this.ensureAccountOption(
    //   // this.warehouseLookup,
    //   data.reservedWarehouseId,
    //   data.reservedWarehouseName
    // );
    this.ensureCustomerOption(data.customerAccountId, data.customerAccountName);

    if (data.imageUrl) {
      if (this.imagePreviewProfile?.startsWith('blob:')) {
        URL.revokeObjectURL(this.imagePreviewProfile);
      }
      this.imagePreviewProfile = `${environment.baseUrl}/${data.imageUrl}`;
      this.profileImageSelected = null;
    }
  }

  private loadAllCustomers(): void {
    const state = this.customersLookup;
    if (state.loading || state.loadedAll) return;
    state.loading = true;

    this._customersService
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = this.mapCustomerRows(res);
          if (rows.length) {
            state.items = rows;
            state.loadedAll = true;
            state.hasMore = false;
            state.loading = false;
            return;
          }

          state.page = 1;
          state.loading = false;
          this.loadMoreCustomersPage();
        },
        error: () => {
          state.page = 1;
          state.loading = false;
          this.loadMoreCustomersPage();
        },
      });
  }

  private loadMoreCustomersPage(): void {
    const state = this.customersLookup;
    if (state.loading || state.loadedAll || !state.hasMore) return;
    state.loading = true;

    this._customersService
      .getAllSendInQuery(state.page, state.pageSize)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = this.mapCustomerRows(res);
          if (!rows.length) {
            state.hasMore = false;
            state.loadedAll = true;
            state.loading = false;
            return;
          }

          state.items = this.mergeLookupItems(state.items, rows);
          state.page += 1;
          state.hasMore = rows.length >= state.pageSize;
          state.loadedAll = !state.hasMore;
          state.loading = false;
        },
        error: () => {
          state.loading = false;
        },
      });
  }

  private mapCustomerRows(res: any): LookupItem[] {
    return this.extractRows(res)
      .map((item) => this.normalizeCustomerItem(item))
      .filter((item): item is LookupItem => item != null);
  }

  private normalizeCustomerItem(item: any): LookupItem | null {
    const id = this.toNumber(item?.accountId ?? item?.customerAccountId ?? item?.id);
    if (id == null) return null;

    const name = item?.name ?? item?.nameAr ?? item?.nameEn ?? '';
    const code = item?.code ?? '';

    return {
      id,
      name: code ? `${code} - ${name}` : String(name || id),
    };
  }

  private ensureCustomerOption(id?: number | string | null, name?: string | null): void {
    const normalizedId = this.toNumber(id);
    if (normalizedId == null) return;

    if (!this.customersLookup.items.some((item) => item.id === normalizedId)) {
      this.customersLookup.items = [
        ...this.customersLookup.items,
        { id: normalizedId, name: name?.trim() || String(normalizedId) },
      ];
    }
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

  private loadGroups(): void {
    this.groupsLoading = true;
    this._groupsService
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.groupsList = (res?.data?.rows ?? []).map((item: any) => ({
            id: item.id,
            name: item.name ?? String(item.id),
          }));
          this.groupsLoading = false;
        },
        error: () => {
          this.groupsLoading = false;
        },
      });
  }

  private createAccountLookupState(method: SelectedAccountMethod): AccountLookupState {
    return {
      method,
      items: [],
      page: 1,
      pageSize: 50,
      loading: false,
      hasMore: true,
      loadedAll: false,
    };
  }

  private loadAllAccounts(state: AccountLookupState): void {
    if (state.loading || state.loadedAll) return;
    state.loading = true;

    this._accountsService
      .getAccountsByMethod(state.method)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = this.mapAccountRows(res);
          if (rows.length) {
            state.items = rows;
            state.loadedAll = true;
            state.hasMore = false;
            state.loading = false;
            return;
          }

          state.page = 1;
          state.loading = false;
          this.loadMoreAccounts(state);
        },
        error: () => {
          state.page = 1;
          state.loading = false;
          this.loadMoreAccounts(state);
        },
      });
  }

  private loadMoreAccounts(state: AccountLookupState): void {
    if (state.loading || state.loadedAll || !state.hasMore) return;
    state.loading = true;

    this._accountsService
      .getAccountsByMethod(state.method, state.page, state.pageSize)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = this.mapAccountRows(res);
          if (!rows.length) {
            state.hasMore = false;
            state.loadedAll = true;
            state.loading = false;
            return;
          }

          state.items = this.mergeLookupItems(state.items, rows);
          state.page += 1;
          state.hasMore = rows.length >= state.pageSize;
          state.loadedAll = !state.hasMore;
          state.loading = false;
        },
        error: () => {
          state.loading = false;
        },
      });
  }

  private mapAccountRows(res: any): LookupItem[] {
    return this.extractRows(res)
      .map((item) => this.normalizeAccountItem(item))
      .filter((item): item is LookupItem => item != null);
  }

  private mergeLookupItems(current: LookupItem[], incoming: LookupItem[]): LookupItem[] {
    const merged = new Map<number, LookupItem>();
    [...current, ...incoming].forEach((item) => merged.set(item.id, item));
    return Array.from(merged.values());
  }

  private ensureAccountOption(
    state: AccountLookupState,
    id?: number | string | null,
    name?: string | null
  ): void {
    const normalizedId = this.toNumber(id);
    if (normalizedId == null) return;

    if (!state.items.some((item) => item.id === normalizedId)) {
      state.items = [
        ...state.items,
        { id: normalizedId, name: name?.trim() || String(normalizedId) },
      ];
    }
  }

  private buildUserFormData(): FormData {
    const raw = this.userForm.getRawValue();
    const formData = new FormData();

    formData.append('userName', raw.userName?.trim() ?? '');
    formData.append('branchId', String(this.toNumber(raw.branchId) ?? ''));
    formData.append('groupId', String(this.toNumber(raw.groupId) ?? ''));
    formData.append('defaultCashBoxAccountId', String(this.toNumber(raw.defaultCashBoxAccountId) ?? ''));
    formData.append('defaultBankAccountId', String(this.toNumber(raw.defaultBankAccountId) ?? ''));
    formData.append('customerAccountId', String(this.toNumber(raw.customerAccountId) ?? ''));
    formData.append(
      'defaultPurchaseCashBoxAccountId',
      String(this.toNumber(raw.defaultPurchaseCashBoxAccountId) ?? '')
    );
    formData.append('defaultWarehouseId', String(this.toNumber(raw.defaultWarehouseId) ?? ''));
    formData.append('purchaseWarehouseId', String(this.toNumber(raw.purchaseWarehouseId) ?? ''));
    formData.append('reservedWarehouseId', String(this.toNumber(raw.reservedWarehouseId) ?? ''));
    formData.append('isActive', String(raw.isActive ?? true));
    formData.append('notes', raw.notes?.trim() ?? '');

    if (this.profileImageSelected) {
      formData.append('image', this.profileImageSelected);
    }

    return formData;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isNaN(num) ? null : num;
  }

  private extractRows(res: any): any[] {
    const data = res?.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(res?.rows)) return res.rows;
    if (Array.isArray(res)) return res;
    return [];
  }

  private normalizeAccountItem(item: any): LookupItem | null {
    const rawId =
      item?.accountId ??
      item?.id ??
      item?.chartOfAccountId ??
      item?.warehouseId ??
      item?.accountNo;

    const id = this.toNumber(rawId);
    if (id == null) return null;

    const name =
      item?.accountName ??
      item?.name ??
      item?.nameAr ??
      item?.nameEn ??
      item?.warehouseName ??
      '';
    const code = item?.accountCode ?? item?.code ?? '';

    return {
      id,
      name: code && name ? `${code} - ${name}` : String(name || code || id),
    };
  }

  private syncPasswordValidators(): void {
    const passwordControl = this.userForm.get('password');
    if (!passwordControl) return;

    if (this.isEditMode) {
      passwordControl.setValidators([Validators.minLength(6), Validators.maxLength(20)]);
    } else {
      passwordControl.setValidators([
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(20),
      ]);
    }

    passwordControl.updateValueAndValidity({ emitEvent: false });
  }
}
