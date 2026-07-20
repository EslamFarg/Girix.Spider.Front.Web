import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import IntlTelInput from '@intl-tel-input/angular';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { BranchService } from '../services/branch-service';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { BranchModel } from '../models/branch';

@Component({
  selector: 'app-add-branch',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    FormError,
    NgClass,
    SharedConfirmDialog,
    IntlTelInput,
  ],
  templateUrl: './add-branch.html',
  styleUrl: './add-branch.scss',
})
export class AddBranch extends FormComponentBase implements OnInit {
  private _fb = inject(FormBuilder);
  private _branchService = inject(BranchService);
  private _destroyRef = inject(DestroyRef);
  private _messageServices = inject(MessageService);

  loadUtils = () => import('intl-tel-input/utils');

  branchForm = this._fb.group({
    accountNumber: [{ value: '', disabled: true }],
    nameAr: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        entityNameValidator(),
      ],
    ],
    nameEn: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        entityNameValidator(),
      ],
    ],
    phoneNumber: ['', [Validators.required, egyptSaudiPhoneValidator]],
    address: ['', [Validators.maxLength(250)]],
    notes: ['', [Validators.maxLength(500)]],
  });

  branchSearchControl = new FormControl('');
  pageSize = 10;
  showDeleteDialog = false;

  ngOnInit(): void {
    this.branchForm
      .get('nameAr')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        this.branchForm.patchValue({ nameEn: value }, { emitEvent: false });
      });

    this.refreshActions();
    this.loadBranch();
  }

  loadBranch(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) return;

    this._branchService
      .getById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.fillForm(res.data);
          this.changeButtonState(res.data.id, true);
          this.refreshActions();
        },
      });
  }

  searchBranchByCode(): void {
    const query = this.branchSearchControl.value?.trim();
    if (!query) {
      this._messageServices.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يرجى إدخال كود الفرع',
      });
      return;
    }

    const payload = buildSearchPayload(query, this.pageSize, SearchableColumnEnum.Code);

    this._branchService
      .search(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const rows = res?.data?.rows ?? [];
          if (!rows.length) {
            this._messageServices.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على الفرع',
            });
            return;
          }

          const branchId = rows[0].id;
          this._branchService
            .getById(branchId)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: (branchRes: any) => {
                this.fillForm(branchRes.data);
                this.changeButtonState(branchRes.data.id, true);
                this.refreshActions();
                this.branchSearchControl.setValue('');
              },
            });
        },
      });
  }

  save(): void {
    if (this.branchForm.invalid) {
      this.branchForm.markAllAsTouched();
      return;
    }

    const payload = {
      nameAr: this.branchForm.value.nameAr,
      nameEn: this.branchForm.value.nameEn,
      phoneNumber: this.branchForm.value.phoneNumber,
      address: this.branchForm.value.address,
      notes: this.branchForm.value.notes,
    };

    if (!this.isEditMode) {
      this._branchService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res: any) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            this.loadBranchById(res.data);
          },
        });
      return;
    }

    const updatePayload = {
      id: this.idUpdate,
      ...payload,
    };

    this._branchService
      .updateWithOutPathParameter(updatePayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageServices.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
          this.loadBranchById(this.idUpdate);
        },
      });
  }

  reset(): void {
    this.branchForm.reset();
    this.branchForm.controls.accountNumber.setValue('', { emitEvent: false });
    this.idUpdate = 0;
    this.isEditMode = false;
    this.branchSearchControl.reset();
    this._sharedStateService.clearSelectedId();
    this.refreshActions();
  }

  delete(): void {
    this.showDeleteDialog = true;
  }

  deleteDialog(): void {
    if (this.idUpdate <= 0) return;

    this._branchService
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

  private loadBranchById(id: number): void {
    this._branchService
      .getById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.fillForm(res.data);
          this.changeButtonState(res.data.id, true);
          this.refreshActions();
        },
      });
  }

  private fillForm(data: BranchModel): void {
    this.branchForm.controls.accountNumber.setValue(this.getAccountNumber(data), {
      emitEvent: false,
    });
    this.branchForm.patchValue({
      nameAr: data.nameAr ?? data.name ?? '',
      nameEn: data.nameEn ?? data.name ?? '',
      phoneNumber: data.phoneNumber ?? '',
      address: data.address ?? '',
      notes: data.notes ?? '',
    });
  }

  private getAccountNumber(data: BranchModel): string {
    return String(
      data.accountNumber ??
        (data as any).accountCode ??
        (data as any).accountNo ??
        (data as any).accountId ??
        ''
    );
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }
}