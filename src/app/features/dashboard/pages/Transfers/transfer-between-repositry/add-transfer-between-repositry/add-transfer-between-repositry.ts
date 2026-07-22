import { Component, DestroyRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Dialog } from 'primeng/dialog';
import { APP_CONSTANTS } from '../../../../../../shared/constants/app.constants';
import * as CryptoJS from 'crypto-js';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LookupFacade } from '../../../../../../shared/base/LookupFacade';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import {
  AutoComplete,
  AutoCompleteCompleteEvent,
  AutoCompleteModule,
} from 'primeng/autocomplete';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DirectTransferService } from '../services/direct-transfer-service';
import {
  CreateDirectTransferPayload,
  DirectTransferById,
  UpdateDirectTransferPayload,
} from '../models/direct-transfer';
import { NgClass } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { TransferRequestService } from '../../inventory-transfer-order/services/transfer-request-service';

@Component({
  selector: 'app-add-transfer-between-repositry',
  imports: [
    PageHeader,
    DatePicker,
    NgSelectComponent,
    Dialog,
    ReactiveFormsModule,
    FormError,
    AutoCompleteModule,
    NgClass,
    SharedConfirmDialog,
  ],
  templateUrl: './add-transfer-between-repositry.html',
  styleUrl: './add-transfer-between-repositry.scss',
})
export class AddTransferBetweenRepositry
  extends FormComponentBase
  implements OnInit, OnDestroy
{
  @ViewChild('autoComplete') autoComplete!: AutoComplete;

  private _fb = inject(FormBuilder);
  _lookupFacade = inject(LookupFacade);
  private _directTransferService = inject(DirectTransferService);
  private _transferServices = inject(TransferRequestService);
  private _destroyRef = inject(DestroyRef);
  private _messageService = inject(MessageService);

  settingsUser: any;
  dataUnits: any[] = [];
  items: { label: string; value: number }[] = [];
  requestSearchControl = new FormControl('');
  searchControl = new FormControl('');
  editingIndex: number | null = null;
  visible = false;
  showDeleteDialog = false;
  printCount = 0;
  editCount = 0;

  page = 0;
  pageSize = 10;
  loading = false;
  hasMore = true;

  explorerBtn = {
    label: 'مستكشف تحويلات بين المستودعات ',
    link: '/transfer-between-repositry/explorer',
  };

  transferForm = this._fb.group({
    employeeName: [''],
    fromWarehouseId: [null as number | null, [Validators.required]],
    toWarehouseId: [null as number | null, [Validators.required]],
    date: [new Date()],
    notes: [''],
    lines: this._fb.array([]),
  });

  addItemForm!: FormGroup;

  ngOnInit(): void {
    this.decryptApplicationSettings();
    this.loadMoreInventories();
    this.initAddItemForm();
    this.loadDirectTransfer();
    this.refreshActions();
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  get lines(): FormArray {
    return this.transferForm.get('lines') as FormArray;
  }

  save(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
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

    const fromWarehouseId = this.transferForm.value.fromWarehouseId;
    const toWarehouseId = this.transferForm.value.toWarehouseId;

    if (fromWarehouseId == null || toWarehouseId == null) {
      return;
    }

    const linesPayload = this.lines.controls.map((line) => ({
      productId: Number(line.get('productId')?.value),
      productCardId: Number(line.get('productCardId')?.value),
      quantity: Number(line.get('quantity')?.value) || 0,
    }));

    if (!this.isEditMode) {
      const payload: CreateDirectTransferPayload = {
        reference: null,
        fromWarehouseId,
        toWarehouseId,
        notes: this.transferForm.value.notes?.trim() || null,
        lines: linesPayload,
      };

      this._directTransferService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageService.add({
              severity: 'success',
              summary: 'تم الحفظ',
              detail: 'تم حفظ التحويل بنجاح',
            });
            const createdId = res?.data?.id ?? res?.data;
            if (createdId) {
              this.loadDirectTransferById(Number(createdId));
            }
          },
        });
      return;
    }

    const updatePayload: UpdateDirectTransferPayload = {
      id: this.idUpdate,
      reference: null,
      fromWarehouseId,
      toWarehouseId,
      notes: this.transferForm.value.notes?.trim() || null,
      lines: linesPayload,
    };

    this._directTransferService
      .update(updatePayload, this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'تم التعديل',
            detail: 'تم تعديل التحويل بنجاح',
          });
          this.loadDirectTransferById(this.idUpdate);
        },
      });
  }

  reset(): void {
    this.transferForm.reset({
      employeeName: this.settingsUser?.userName ?? '',
      date: new Date(),
    });
    this.lines.clear();
    this.resetAddItemForm();
    this.requestSearchControl.reset();
    this.editingIndex = null;
    this.printCount = 0;
    this.editCount = 0;
    this._sharedStateService.clearSelectedId();
    this.changeButtonState(0, false);
  }

  delete(): void {
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    this._directTransferService
      .delete(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'تم الحذف',
            detail: 'تم حذف التحويل بنجاح',
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

  searchDirectTransfer(event?: Event): void {
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

    this._directTransferService
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
          const row = res?.data?.rows?.[0];

          if (!row?.id) {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على طلب بهذا الرقم',
            });
            return;
          }

          this.loadDirectTransferById(row.id);
          this.requestSearchControl.reset();
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
      productId: [null, Validators.required],
      productCardId: [null, Validators.required],
    });
  }

  createLine(value: any): FormGroup {
    return this._fb.group({
      productId: [value.productId],
      productCardId: [value.productCardId],
      quantity: [value.qty, Validators.required],
      code: [value.code],
      itemName: [value.itemName],
      unitName: [value.unitName],
      unitId: [value.unitId],
    });
  }

  addNewLine(): void {
    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      return;
    }

    if (this.editingIndex === null) {
      this.lines.push(this.createLine(this.addItemForm.getRawValue()));
      this.resetAddItemForm();
      return;
    }

    this.updateLine(this.editingIndex);
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
        const rows = Array.isArray(res?.data) ? res.data : (res?.data?.rows ?? []);
        this.items = rows.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));

        setTimeout(() => this.autoComplete?.show());
      });
  }

  onSelectProduct(event: any): void {
    const productId =
      typeof event.value === 'object' ? event.value?.value : event.value;

    if (!productId) {
      return;
    }

    this._transferServices
      .lookupById(productId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.applyProductLookup(res.data);
      });
  }

  onSearchByCode(event: Event): void {
    const code = (event.target as HTMLInputElement).value?.trim();
    if (!code) {
      return;
    }

    this._transferServices
      .searchByCode(code)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.applyProductLookup(res.data);
      });
  }

  onUnitChange(selected: number | { unitId?: number } | null): void {
    const unitId =
      selected != null && typeof selected === 'object'
        ? (selected.unitId ?? null)
        : selected;

    if (unitId == null) {
      this.addItemForm.patchValue(
        { unitName: '', productId: null, productCardId: null },
        { emitEvent: false },
      );
      return;
    }

    const unit = this.dataUnits.find((x) => x.unitId === unitId);
    if (!unit) {
      return;
    }

    this.addItemForm.patchValue({
      unitName: unit.unitName ?? '',
      productId: unit.productId ?? null,
      productCardId: unit.productCardId ?? null,
    });
  }

  editingLine(index: number): void {
    this.editingIndex = index;
    const line = this.lines.at(index);

    this.addItemForm.patchValue({
      code: line.get('code')?.value,
      itemName: line.get('itemName')?.value,
      unitId: line.get('unitId')?.value,
      unitName: line.get('unitName')?.value,
      qty: line.get('quantity')?.value,
      productId: line.get('productId')?.value,
      productCardId: line.get('productCardId')?.value,
    });

    const code = line.get('code')?.value;
    if (!code) {
      return;
    }

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

  updateLine(index: number): void {
    if (this.addItemForm.invalid) {
      this.addItemForm.markAllAsTouched();
      return;
    }

    const value = this.addItemForm.getRawValue();
    this.lines.at(index).patchValue({
      code: value.code,
      itemName: value.itemName,
      unitId: value.unitId,
      unitName: value.unitName,
      quantity: value.qty,
      productId: value.productId,
      productCardId: value.productCardId,
    });

    this.editingIndex = null;
    this.resetAddItemForm();
  }

  loadMoreInventories(): void {
    if (this.loading || !this.hasMore) {
      return;
    }

    this.loading = true;
    const nextPage = this.page + 1;

    this._lookupFacade.loadInventoriesWithPagination(nextPage, this.pageSize).subscribe({
      next: (res: any) => {
        if (!res?.data?.rows?.length) {
          this.hasMore = false;
          return;
        }
        this.page = nextPage;
      },
      complete: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private loadDirectTransfer(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) {
      return;
    }
    this.loadDirectTransferById(Number(id));
  }

  private loadDirectTransferById(id: number): void {
    this._directTransferService
      .getById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          if (res?.data) {
            this.fillForm(res.data);
          }
        },
      });
  }

  private fillForm(data: DirectTransferById): void {
    const dateValue =
      data.date ?? data.transferDate ?? data.createdDate ?? null;

    this.transferForm.patchValue({
      employeeName: data.employeeName ?? this.settingsUser?.userName ?? '',
      fromWarehouseId: data.fromWarehouseId ?? null,
      toWarehouseId: data.toWarehouseId ?? null,
      date: dateValue ? new Date(dateValue) : new Date(),
      notes: data.notes ?? '',
    });

    this.printCount = data.printCount ?? 0;
    this.editCount = data.editCount ?? 0;
    this.lines.clear();

    const details = data.lines ?? data.directTransferLines ?? [];
    details.forEach((item) => {
      this.lines.push(
        this.createLine({
          productId: item.productId,
          productCardId: item.productCardId,
          qty: item.quantity,
          code: item.productCode ?? item.code ?? '',
          itemName: item.productName ?? item.itemName ?? '',
          unitName: item.unitName ?? '',
          unitId: item.unitId,
        }),
      );
    });

    this.changeButtonState(data.id, true);
    this._sharedStateService.setSelectedId(data.id);
    this.editingIndex = null;
  }

  private applyProductLookup(data: any): void {
    if (!data) {
      return;
    }

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
      productId: data.productId ?? defaultUnit?.productId ?? null,
      productCardId: defaultUnit?.productCardId ?? null,
    });
  }

  private decryptApplicationSettings(): void {
    const encrypted = localStorage.getItem('applicationSettings');
    if (!encrypted) {
      return;
    }

    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, APP_CONSTANTS.secretKey);
      const settings = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
      this.settingsUser = settings.user;

      this.transferForm.patchValue({
        employeeName: settings.user?.userName ?? '',
      });
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
      productId: null,
      productCardId: null,
    });
    this.dataUnits = [];
    this.searchControl.reset();
  }
}
