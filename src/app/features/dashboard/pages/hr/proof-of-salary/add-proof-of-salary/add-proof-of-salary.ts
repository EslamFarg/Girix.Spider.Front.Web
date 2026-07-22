import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PageHeaderSearch } from '../../../../../../shared/ui/page-header-search/page-header-search';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { SectionsService } from '../../sections/services/sections-service';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { ProofService } from '../services/proof-service';
import {
  CreateSalaryPostingModel,
  PayrollEmployeeModel,
  SalaryPostingDetailModel,
  UpdateSalaryPostingModel,
} from '../models/proof-of-salary';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-proof-of-salary',
  imports: [Paginator, PageHeaderSearch, NgSelectComponent, ReactiveFormsModule, FormError, NgClass],
  templateUrl: './add-proof-of-salary.html',
  styleUrl: './add-proof-of-salary.scss',
})
export class AddProofOfSalary implements OnInit, OnDestroy {
  private readonly _departmentsService = inject(SectionsService);
  private readonly _proofService = inject(ProofService);
  private readonly _messageService = inject(MessageService);
  private readonly _sharedStateService = inject(SharedStateServices);
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _router = inject(Router);

  readonly maxMoneyValue = 1_000_000;
  readonly maxCountValue = 999;

  private readonly moneyValidators = [
    Validators.required,
    Validators.min(0),
    Validators.max(this.maxMoneyValue),
  ];

  private readonly countValidators = [
    Validators.required,
    Validators.min(0),
    Validators.max(this.maxCountValue),
  ];

  searchForm = this._fb.group({
    departmentId: [0, [Validators.required]],
    month: [1, [Validators.required]],
    year: [2026, [Validators.required]],
  });

  payrollForm = this._fb.group({
    items: this._fb.array<FormGroup>([]),
  });

  monthsList = [
    { name: 'يناير', id: 1 },
    { name: 'فبراير', id: 2 },
    { name: 'مارس', id: 3 },
    { name: 'أبريل', id: 4 },
    { name: 'مايو', id: 5 },
    { name: 'يونيو', id: 6 },
    { name: 'يوليو', id: 7 },
    { name: 'أغسطس', id: 8 },
    { name: 'سبتمبر', id: 9 },
    { name: 'أكتوبر', id: 10 },
    { name: 'نوفمبر', id: 11 },
    { name: 'ديسمبر', id: 12 },
  ];

  yearsList = [
    { name: '2026', id: 2026 },
    { name: '2027', id: 2027 },
    { name: '2028', id: 2028 },
    { name: '2029', id: 2029 },
    { name: '2030', id: 2030 },
    { name: '2031', id: 2031 },
    { name: '2032', id: 2032 },
    { name: '2033', id: 2033 },
    { name: '2034', id: 2034 },
    { name: '2035', id: 2035 },
    { name: '2036', id: 2036 },
    { name: '2037', id: 2037 },
    { name: '2038', id: 2038 },
    { name: '2039', id: 2039 },
    { name: '2040', id: 2040 },
  ];

  first = 0;
  rows = 10;
  hasSearchResults = false;
  isEditMode = false;
  salaryPostingId: number | null = null;
  departmentsList: { id: number | null; name: string }[] = [];
  private postingDate: string | null = null;
  private notes: string | null = null;

  ngOnInit(): void {
    this.loadDepartmentsItems();

    const selectedId = this._sharedStateService.selectedId$();
    if (selectedId) {
      this.loadSalaryPostingById(selectedId);
    }
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  get items(): FormArray<FormGroup> {
    return this.payrollForm.get('items') as FormArray<FormGroup>;
  }

  get totalRecords(): number {
    return this.items.length;
  }

  get pagedItems(): FormGroup[] {
    return this.items.controls.slice(this.first, this.first + this.rows) as FormGroup[];
  }

  loadDepartmentsItems(): void {
    this._departmentsService
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.departmentsList = [{ id: 0, name: 'الكل' }, ...(res.data?.rows ?? [])];
        },
      });
  }

  loadSalaryPostingById(id: number): void {
    this._proofService
      .getSalaryPostingById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          if (!data) {
            return;
          }

          this.isEditMode = true;
          this.salaryPostingId = data.id;
          this.postingDate = data.postingDate ?? new Date().toISOString();
          this.notes = data.notes ?? null;

          this.searchForm.patchValue({
            departmentId: data.departmentId ?? 0,
            month: data.month ?? 1,
            year: this.getYearIdFromActualYear(data.year ?? 2026),
          });

          const rows = (data.details ?? []).map((detail) =>
            this.mapDetailToPayrollEmployee(detail)
          );
          this.buildPayrollItems(rows);
          this.hasSearchResults = rows.length > 0;
          this.first = 0;
        },
      });
  }

  search(): void {
    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    const { departmentId, month, year } = this.searchForm.getRawValue();

    this.first = 0;
    this._proofService
      .getPayrollEmployees({
        month: String(month!),
        year: year!.toString(),
        departmentId,
      })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        // next: (res) => {
        //   if (res.isSuccess) {
        //     const data = res.data;
        //     const rows = Array.isArray(data) ? data : (data?.rows ?? []);
        //     this.buildPayrollItems(rows);
        //     this.hasSearchResults = rows.length > 0;
        //   } else {
        //     // this._messageService.add({
        //     //   severity: 'error',
        //     //   summary: 'خطاء',
        //     //   detail: res.message,
        //     // });
        //     // console.log('res', res);
        //     // this.items.clear();د
           
        //     this.hasSearchResults = false;
        //   }
        //   // const data = res.data;
        //   // const rows = Array.isArray(data) ? data : (data?.rows ?? []);
        //   // this.buildPayrollItems(rows);
        //   // this.hasSearchResults = rows.length > 0;
        // },

        next: (res) => {
          if (res.isSuccess) {
            const data = res.data;
            const rows = Array.isArray(data) ? data : (data?.rows ?? []);
        
            this.buildPayrollItems(rows);
            this.hasSearchResults = rows.length > 0;
          } else {
            this.resetPayrollTable();
        
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لا توجد بيانات للحفظ، قم بالبحث أولاً',
            });
          }
        },
        error: (err) => {
          this.resetPayrollTable();
        
         
        }
      });
  }

  private resetPayrollTable(): void {
    this.items.clear();          // يمسح كل صفوف الجدول
    this.first = 0;              // يرجع لأول صفحة
    this.hasSearchResults = false;
  
    this.payrollForm.markAsPristine();
    this.payrollForm.markAsUntouched();
  }

  saveProof(): void {
    if (!this.hasSearchResults || this.items.length === 0) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لا توجد بيانات للحفظ، قم بالبحث أولاً',
      });
      return;
    }

    if (this.searchForm.invalid) {
      this.searchForm.markAllAsTouched();
      return;
    }

    if (this.payrollForm.invalid) {
      this.payrollForm.markAllAsTouched();
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'يرجى التأكد من صحة جميع الحقول قبل الحفظ',
      });
      return;
    }

    const payload = this.buildSavePayload();

    const request$ = this.isEditMode && this.salaryPostingId
      ? this._proofService.updateSalaryPosting({
          ...payload,
          id: this.salaryPostingId,
        } as UpdateSalaryPostingModel)
      : this._proofService.createSalaryPosting(payload);

    request$
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const wasCreate = !this.isEditMode;

          if (wasCreate) {
            this.isEditMode = true;
            this.salaryPostingId = res.data;
          }

          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: wasCreate
              ? 'تم حفظ إثبات الرواتب بنجاح'
              : 'تم تعديل إثبات الرواتب بنجاح',
          });
        },
      });
  }

  get saveButtonLabel(): string {
    return this.isEditMode ? 'تعديل' : 'حفظ';
  }

  onPageChange(event: { first?: number; rows?: number }): void {
    this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
  }

  deleteEmployee(employeeId: number): void {
    const index = this.items.controls.findIndex(
      (control) => control.get('employeeId')?.value === employeeId
    );

    if (index === -1) {
      return;
    }

    this.items.removeAt(index);
    this.hasSearchResults = this.items.length > 0;

    if (this.first >= this.totalRecords && this.first > 0) {
      this.first = Math.max(0, this.first - this.rows);
    }
  }

  normalizeNumberField(group: FormGroup, fieldName: string): void {
    const control = group.get(fieldName);
    const value = control?.value;

    if (value === null || value === '' || value === undefined) {
      control?.setValue(0, { emitEvent: false });
    }
  }

  normalizeMoneyField(group: FormGroup, fieldName: string): void {
    const control = group.get(fieldName);
    let value = control?.value;

    if (value === null || value === '' || value === undefined) {
      value = 0;
    }

    let num = this.toNumber(value);
    if (num > this.maxMoneyValue) {
      num = this.maxMoneyValue;
    }

    control?.setValue(num, { emitEvent: false });
    this.updateNetSalary(group);
  }

  normalizeCountField(group: FormGroup, fieldName: string): void {
    const control = group.get(fieldName);
    let value = control?.value;

    if (value === null || value === '' || value === undefined) {
      value = 0;
    }

    let num = this.toNumber(value);
    if (num > this.maxCountValue) {
      num = this.maxCountValue;
    }

    control?.setValue(num, { emitEvent: false });
  }

  onMoneyFieldChange(group: FormGroup): void {
    this.updateNetSalary(group);
  }

  isFieldInvalid(group: FormGroup, fieldName: string): boolean {
    const control = group.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  private buildPayrollItems(rows: PayrollEmployeeModel[]): void {
    this.items.clear();
    rows.forEach((row) => this.items.push(this.createPayrollItemGroup(row)));
  }

  private createPayrollItemGroup(item: PayrollEmployeeModel): FormGroup {
    const group = this._fb.group({
      employeeId: [item.employeeId],
      employeeNumber: [item.employeeNumber ?? ''],
      employeeName: [item.employeeName ?? ''],
      netSalary: [this.toNumber(item.netSalary)],
      basicSalary: [this.toNumber(item.basicSalary), this.moneyValidators],
      allowancesCount: [this.toNumber(item.allowancesCount), this.countValidators],
      allowancesAmount: [this.toNumber(item.allowancesAmount), this.moneyValidators],
      bonusAmount: [this.toNumber(item.bonusAmount), this.moneyValidators],
      bonusCount: [this.toNumber(item.bonusCount)],
      penaltyAmount: [this.toNumber(item.penaltyAmount), this.moneyValidators],
      penaltyCount: [this.toNumber(item.penaltyCount)],
      advanceAmount: [this.toNumber(item.advanceAmount), this.moneyValidators],
      advanceCount: [this.toNumber(item.advanceCount)],
      deductionAmount: [this.toNumber(item.deductionAmount)],
      deductionCount: [this.toNumber(item.deductionCount)],
      overtimeAmount: [this.toNumber(item.overtimeAmount), this.moneyValidators],
      overtimeCount: [this.toNumber(item.overtimeCount)],
      delayAmount: [this.toNumber(item.delayAmount), this.moneyValidators],
      delayCount: [this.toNumber(item.delayCount)],
      absenceAmount: [this.toNumber(item.absenceAmount), this.moneyValidators],
      absenceCount: [this.toNumber(item.absenceCount)],
      vacationAmount: [this.toNumber(item.vacationAmount), this.moneyValidators],
      vacationCount: [this.toNumber(item.vacationCount)],
    });

    this.updateNetSalary(group);
    return group;
  }

  private updateNetSalary(group: FormGroup): void {
    const additions =
      this.toNumber(group.get('basicSalary')?.value) +
      this.toNumber(group.get('allowancesAmount')?.value) +
      this.toNumber(group.get('overtimeAmount')?.value) +
      this.toNumber(group.get('vacationAmount')?.value) +
      this.toNumber(group.get('bonusAmount')?.value);

    const deductions =
      this.toNumber(group.get('delayAmount')?.value) +
      this.toNumber(group.get('absenceAmount')?.value) +
      this.toNumber(group.get('penaltyAmount')?.value) +
      this.toNumber(group.get('advanceAmount')?.value) +
      this.toNumber(group.get('deductionAmount')?.value);

    const netSalary = Math.max(0, this.roundMoney(additions - deductions));
    group.get('netSalary')?.setValue(netSalary, { emitEvent: false });
  }

  private roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private buildSavePayload(): CreateSalaryPostingModel {
    const { month, year } = this.searchForm.getRawValue();

    return {
      month: month!,
      year: year!,
      postingDate: this.postingDate ?? new Date().toISOString(),
      notes: this.notes,
      details: this.items.controls.map((control) => this.mapDetailFromGroup(control)),
    };
  }

  private mapDetailToPayrollEmployee(detail: SalaryPostingDetailModel): PayrollEmployeeModel {
    return {
      employeeId: detail.employeeId,
      employeeNumber: detail.employeeNumber ?? String(detail.employeeId),
      employeeName: detail.employeeName ?? '-',
      departmentId: detail.departmentId ?? 0,
      departmentName: detail.departmentName ?? '',
      basicSalary: detail.basicSalary,
      allowancesAmount: detail.allowancesAmount,
      allowancesCount: detail.allowancesCount,
      bonusAmount: detail.bonusAmount,
      bonusCount: detail.bonusCount,
      penaltyAmount: detail.penaltyAmount,
      penaltyCount: detail.penaltyCount,
      advanceAmount: detail.advanceAmount,
      advanceCount: detail.advanceCount,
      deductionAmount: detail.deductionAmount,
      deductionCount: detail.deductionCount,
      overtimeAmount: detail.overtimeAmount,
      overtimeCount: detail.overtimeCount,
      delayAmount: detail.delayAmount,
      delayCount: detail.delayCount,
      absenceAmount: detail.absenceAmount,
      absenceCount: detail.absenceCount,
      vacationAmount: detail.vacationAmount,
      vacationCount: detail.vacationCount,
      netSalary: detail.netSalary,
    };
  }

  private mapDetailFromGroup(control: FormGroup): SalaryPostingDetailModel {
    return {
      employeeId: control.get('employeeId')?.value,
      basicSalary: this.toNumber(control.get('basicSalary')?.value),
      allowancesAmount: this.toNumber(control.get('allowancesAmount')?.value),
      allowancesCount: this.toNumber(control.get('allowancesCount')?.value),
      bonusAmount: this.toNumber(control.get('bonusAmount')?.value),
      bonusCount: this.toNumber(control.get('bonusCount')?.value),
      penaltyAmount: this.toNumber(control.get('penaltyAmount')?.value),
      penaltyCount: this.toNumber(control.get('penaltyCount')?.value),
      advanceAmount: this.toNumber(control.get('advanceAmount')?.value),
      advanceCount: this.toNumber(control.get('advanceCount')?.value),
      deductionAmount: this.toNumber(control.get('deductionAmount')?.value),
      deductionCount: this.toNumber(control.get('deductionCount')?.value),
      overtimeAmount: this.toNumber(control.get('overtimeAmount')?.value),
      overtimeCount: this.toNumber(control.get('overtimeCount')?.value),
      delayAmount: this.toNumber(control.get('delayAmount')?.value),
      delayCount: this.toNumber(control.get('delayCount')?.value),
      absenceAmount: this.toNumber(control.get('absenceAmount')?.value),
      absenceCount: this.toNumber(control.get('absenceCount')?.value),
      vacationAmount: this.toNumber(control.get('vacationAmount')?.value),
      vacationCount: this.toNumber(control.get('vacationCount')?.value),
      netSalary: this.toNumber(control.get('netSalary')?.value),
    };
  }

  private toNumber(value: number | null | undefined): number {
    return value == null || Number.isNaN(Number(value)) ? 0 : Number(value);
  }

  // private getActualYear(yearId: number): number {
  //   return 2025 + yearId;
  // }

  private getYearIdFromActualYear(actualYear: number): number {
    const yearId = actualYear - 2025;
    return yearId >= 1 && yearId <= 15 ? yearId : 1;
  }

  explorerProofOfSalary(): void {
    this._router.navigate(['/hr/proof-of-salaries/explorer']);
  }
}
