import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import * as CryptoJS from 'crypto-js';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { LookupFacade } from '../../../../../../shared/base/LookupFacade';
import { APP_CONSTANTS } from '../../../../../../shared/constants/app.constants';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { AccountsService } from '../../../accounts-parent/accounts/services/accounts-service';
import { TransferRequestService } from '../../inventory-transfer-order/services/transfer-request-service';
import {
  CreateIssueOrderPayload,
  IssueOrderDetailDto,
  IssueOrderModel,
  LookupItem,
  UpdateIssueOrderPayload,
} from '../models/issue-order';
import { IssueOrderService } from '../services/issue-order-service';

@Component({
  selector: 'app-add-internal-exchange-permit',
  imports: [
    Dialog,
    NgSelectComponent,
    PageHeader,
    DatePickerModule,
    ReactiveFormsModule,
    FormError,
    AutoCompleteModule,
    NgClass,
    SharedConfirmDialog,
  ],
  templateUrl: './add-internal-exchange-permit.html',
  styleUrl: './add-internal-exchange-permit.scss',
})
export class AddInternalExchangePermit extends FormComponentBase implements OnInit, OnDestroy {
  @ViewChild('autoComplete') autoComplete!: AutoComplete;

  private _fb = inject(FormBuilder);
  private _issueOrderService = inject(IssueOrderService);
  private _transferServices = inject(TransferRequestService);
  private _accountsService = inject(AccountsService);
  _lookupFacade = inject(LookupFacade);
  private _destroyRef = inject(DestroyRef);
  private _messageService = inject(MessageService);

  explorerBtn = {
    label: 'مستكشف اذن صرف داخلي ',
    link: '/internal-exchange-permit/explorer',
  };

  settingsUser: any;
  accountsList: LookupItem[] = [];
  dataUnits: any[] = [];
  items: { label: string; value: number }[] = [];
  permitSearchControl = new FormControl('');
  editingIndex: number | null = null;
  visible = false;
  showDeleteDialog = false;
  printCount = 0;
  editCount = 0;

  inventoryPage = 0;
  inventoryPageSize = 10;
  inventoryLoading = false;
  inventoryHasMore = true;

  issueOrderForm = this._fb.group({
    invoiceNo: [''],
    referenceNo: [''],
    invoiceDate: [new Date(), [Validators.required]],
    warehouseId: [null as number | null, [Validators.required]],
    customerId: [null as number | null],
    notes: [''],
    details: this._fb.array([]),
  });

  addItemForm!: FormGroup;

  ngOnInit(): void {
    this.decryptApplicationSettings();
    this.initAddItemForm();
    this.loadAccounts();
    this.loadMoreInventories();
    this.loadIssueOrder();
    this.refreshActions();

    if (!this.isEditMode) {
      this.loadNextInvoiceNo();
    }
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  get lines(): FormArray {
    return this.issueOrderForm.get('details') as FormArray;
  }

  save(): void {
    if (this.issueOrderForm.invalid) {
      this.issueOrderForm.markAllAsTouched();
      return;
    }

    if (this.lines.length === 0) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب عليك اضافة صنف واحد علي الأقل',
      });
      return;
    }

    const warehouseId = this.issueOrderForm.value.warehouseId;
    if (warehouseId == null) {
      return;
    }

    const payload: CreateIssueOrderPayload = {
      referenceNo: this.issueOrderForm.value.referenceNo?.trim() || null,
      invoiceDate: this.issueOrderForm.value.invoiceDate!,
      warehouseId,
      customerId: this.issueOrderForm.value.customerId ?? null,
      paymentMethodId: 1,
      notes: this.issueOrderForm.value.notes?.trim() || null,
      details: this.buildDetailsPayload(),
    };

    if (!this.isEditMode) {
      this._issueOrderService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageService.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الحفظ بنجاح',
            });
            const createdId = res?.data?.id ?? res?.data;
            if (createdId) {
              this.loadIssueOrderById(Number(createdId));
            }
          },
        });
      return;
    }

    const updatePayload: UpdateIssueOrderPayload = {
      ...payload,
      id: this.idUpdate,
      details: this.buildDetailsPayload(true),
    };

    this._issueOrderService
      .updateIssueOrder(updatePayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
          this.loadIssueOrderById(this.idUpdate);
        },
      });
  }

  reset(): void {
    this.issueOrderForm.reset({
      invoiceDate: new Date(),
    });
    this.lines.clear();
    this.addItemForm.reset({ qty: 1 });
    this.dataUnits = [];
    this.permitSearchControl.reset();
    this.editingIndex = null;
    this.printCount = 0;
    this.editCount = 0;
    this._sharedStateService.clearSelectedId();
    this.changeButtonState(0, false);
    this.loadNextInvoiceNo();
  }

  delete(): void {
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._issueOrderService
      .delete(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
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

  showDialog(): void {
    this.visible = true;
  }

  searchIssueOrder(event?: Event): void {
    const invoiceNo = event
      ? (event.target as HTMLInputElement).value?.trim()
      : this.permitSearchControl.value?.trim();

    if (!invoiceNo) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يجب ادخال رقم الأذن',
      });
      return;
    }

    this._issueOrderService
      .search({
        filter: { invoiceNo },
        pagination: { pageIndex: 1, pageSize: 1 },
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const row = res?.data?.rows?.[0];
          if (!row?.id) {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على أذن بهذا الرقم',
            });
            return;
          }

          this.loadIssueOrderById(row.id);
          this.permitSearchControl.reset();
        },
      });
  }

  initAddItemForm(): void {
    this.addItemForm = this._fb.group({
      code: ['', Validators.required],
      itemName: [''],
      unitName: [''],
      unitId: [null, Validators.required],
      qty: [1, [Validators.required, Validators.min(0.0001)]],
      productCardId: [null, Validators.required],
    });

    this.addItemForm
      .get('unitId')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((unitId) => this.syncSelectedUnit(unitId));
  }

  createLine(value: any): FormGroup {
    return this._fb.group({
      productCardId: [value.productCardId],
      unitId: [value.unitId],
      quantity: [value.qty, Validators.required],
      code: [value.code],
      itemName: [value.itemName],
      unitName: [value.unitName],
      detailId: [value.detailId ?? null],
    });
  }

  addNewLine(): void {
    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      if (!this.addItemForm.get('productCardId')?.value) {
        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: 'يجب اختيار الصنف والوحدة قبل الإضافة',
        });
      }
      return;
    }

    if (this.editingIndex === null) {
      this.lines.push(this.createLine(this.addItemForm.getRawValue()));
      this.resetAddItemForm();
      return;
    }

    this.updateLine(this.editingIndex);
  }

  updateLine(index: number): void {
    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      return;
    }

    const value = this.addItemForm.value;
    this.lines.at(index).patchValue({
      code: value.code,
      itemName: value.itemName,
      unitId: value.unitId,
      unitName: value.unitName,
      quantity: value.qty,
      productCardId: value.productCardId,
    });

    this.editingIndex = null;
    this.resetAddItemForm();
  }

  editLine(index: number): void {
    this.editingIndex = index;
    const line = this.lines.at(index);

    this.addItemForm.patchValue({
      code: line.get('code')?.value,
      itemName: line.get('itemName')?.value,
      unitId: line.get('unitId')?.value,
      unitName: line.get('unitName')?.value,
      qty: line.get('quantity')?.value,
      productCardId: line.get('productCardId')?.value,
    });

    const code = line.get('code')?.value;
    if (!code) return;

    this._transferServices
      .searchByCode(String(code))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.dataUnits = (res?.data?.units ?? []).map((unit: any) => ({
          productId: res.data.productId,
          ...unit,
        }));
      });
  }

  removeLine(index: number): void {
    this.lines.removeAt(index);
    if (this.editingIndex === index) {
      this.editingIndex = null;
      this.resetAddItemForm();
    }
  }

  getTotalQuantity(): number {
    return this.lines.controls.reduce((total, control) => {
      const qty = Number(control.get('quantity')?.value) || 0;
      return total + qty;
    }, 0);
  }

  search(event: AutoCompleteCompleteEvent): void {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.items = [];
      return;
    }

    this._transferServices
      .searchByName(query)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : res?.data?.rows ?? [];
        this.items = rows.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));

        setTimeout(() => this.autoComplete?.show());
      });
  }

  onSelectProduct(event: any): void {
    const productId = typeof event.value === 'object' ? event.value?.value : event.value;
    if (!productId) return;

    this._transferServices
      .lookupById(productId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.applyProductLookup(res.data);
      });
  }

  onSearchByCode(event: Event): void {
    const code = (event.target as HTMLInputElement).value?.trim();
    if (!code) return;

    this._transferServices
      .searchByCode(code)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.applyProductLookup(res.data);
      });
  }

  onUnitChange(selected: number | { unitId?: number } | null): void {
    const unitId =
      selected != null && typeof selected === 'object' ? selected.unitId ?? null : selected;
    this.syncSelectedUnit(unitId);
  }

  private applyProductLookup(data: any): void {
    if (!data) return;

    this.dataUnits = (data.units ?? []).map((unit: any) => ({
      productId: data.productId,
      ...unit,
    }));

    const defaultUnit =
      this.dataUnits.find((unit) => unit.selected || unit.isDefault) ??
      this.dataUnits.find((unit) => unit.unitId === data.unitId) ??
      this.dataUnits[0];

    this.addItemForm.patchValue({
      itemName: data.productName ?? '',
      code: data.productCode ?? '',
      unitId: defaultUnit?.unitId ?? data.unitId ?? null,
      unitName: defaultUnit?.unitName ?? '',
      productCardId: defaultUnit?.productCardId ?? null,
    });
  }

  private syncSelectedUnit(unitId: number | null): void {
    if (unitId == null) {
      this.addItemForm.patchValue({ unitName: '', productCardId: null }, { emitEvent: false });
      return;
    }

    const unit = this.dataUnits.find((x) => x.unitId === unitId);
    if (!unit) return;

    this.addItemForm.patchValue(
      {
        unitName: unit.unitName ?? '',
        productCardId: unit.productCardId ?? null,
      },
      { emitEvent: false },
    );
  }

  loadMoreInventories(): void {
    if (this.inventoryLoading || !this.inventoryHasMore) return;

    this.inventoryLoading = true;
    const nextPage = this.inventoryPage + 1;

    this._lookupFacade.loadInventoriesWithPagination(nextPage, this.inventoryPageSize).subscribe({
      next: (res: any) => {
        if (!res?.data?.rows?.length) {
          this.inventoryHasMore = false;
          return;
        }
        this.inventoryPage = nextPage;
      },
      complete: () => {
        this.inventoryLoading = false;
      },
      error: () => {
        this.inventoryLoading = false;
      },
    });
  }

  private loadIssueOrder(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) return;
    this.loadIssueOrderById(Number(id));
  }

  private loadIssueOrderById(id: number): void {
    this._issueOrderService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.fillForm(res.data);
          }
        },
      });
  }

  private fillForm(data: IssueOrderModel): void {
    this.issueOrderForm.patchValue({
      invoiceNo: data.invoiceNo ?? '',
      referenceNo: data.referenceNo ?? '',
      invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
      warehouseId: data.warehouseId ?? null,
      customerId: data.customerId ?? null,
      notes: data.notes ?? '',
    });

    this.printCount = data.printCount ?? 0;
    this.editCount = data.editCount ?? 0;
    this.lines.clear();

    const details = data.details ?? data.issueOrderDetails ?? [];
    details.forEach((item) => {
      this.lines.push(
        this.createLine({
          productCardId: item.productCardId,
          unitId: item.unitId,
          qty: item.quantity,
          code: item.productCode ?? '',
          itemName: item.productName ?? '',
          unitName: item.unitName ?? '',
          detailId: item.id ?? null,
        }),
      );
    });

    this.ensureAccountOption(data.customerId, data.customerName ?? data.accountName);
    this.changeButtonState(data.id, true);
    this._sharedStateService.setSelectedId(data.id);
    this.editingIndex = null;
  }

  private buildDetailsPayload(includeIds = false): IssueOrderDetailDto[] {
    return this.lines.controls.map((line) => {
      const detail: IssueOrderDetailDto = {
        productCardId: Number(line.get('productCardId')?.value),
        unitId: Number(line.get('unitId')?.value),
        quantity: Number(line.get('quantity')?.value) || 0,
        // price: 0,
        // discountPercent: 0,
        // discountAmount: 0,
        // taxAmount: 0,
        // lineTotal: 0,
      };

      if (includeIds && line.get('detailId')?.value) {
        detail.id = Number(line.get('detailId')?.value);
      }

      return detail;
    });
  }

  private loadNextInvoiceNo(): void {
    this._issueOrderService
      .getNextNo()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const nextNo = res?.data;
          if (nextNo != null) {
            this.issueOrderForm.patchValue({ invoiceNo: String(nextNo) });
          }
        },
      });
  }

  private loadAccounts(): void {
    this._accountsService
      .getAllWithoutPagination()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.accountsList = this.flattenAccounts(res?.data?.data ?? res?.data ?? []);
        },
      });
  }

  private flattenAccounts(data: any[]): LookupItem[] {
    const result: LookupItem[] = [];

    const flatten = (items: any[]) => {
      items.forEach((item) => {
        const code = item.accountCode ?? item.code ?? '';
        const name = item.name ?? item.nameAr ?? item.nameEn ?? '';
        result.push({
          id: item.id,
          name: code && name ? `${code} - ${name}` : String(name || code || item.id),
        });

        if (item.children?.length) {
          flatten(item.children);
        }
      });
    };

    flatten(Array.isArray(data) ? data : []);
    return result;
  }

  private ensureAccountOption(id?: number | null, name?: string | null): void {
    if (id == null) return;

    if (!this.accountsList.some((item) => item.id === id)) {
      this.accountsList = [...this.accountsList, { id, name: name?.trim() || String(id) }];
    }
  }

  private decryptApplicationSettings(): void {
    const encrypted = localStorage.getItem('applicationSettings');
    if (!encrypted) return;

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, APP_CONSTANTS.secretKey);
      const settings = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      this.settingsUser = settings.user;

      if (settings.user?.defaultWarehouseId) {
        this.issueOrderForm.patchValue({
          warehouseId: settings.user.defaultWarehouseId,
        });
      }
    } catch {
      this.settingsUser = null;
    }
  }

  private resetAddItemForm(): void {
    this.addItemForm.reset({
      code: '',
      itemName: '',
      unitId: null,
      unitName: '',
      qty: 1,
      productCardId: null,
    });
    this.dataUnits = [];
  }
}
