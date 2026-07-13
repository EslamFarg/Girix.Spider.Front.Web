import { Component, DestroyRef, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { Observable } from 'rxjs';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { EmployeeAdditionsTypes } from '../../../../../../shared/Enums/enumEmployee.enum';
import { EmployeeByIdResponse, EmployeeModel } from '../../employees/model/employee';
import { EmployeeService } from '../../employees/services/employee-service';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import {
  PayrollAdjustmentCreateModel,
  PayrollAdjustmentModel,
  PayrollAdjustmentUpdateModel,
} from '../models/payroll-adjustment';
import { PayrollAdjustmentService } from '../services/payroll-adjustment-service';

@Component({
  selector: 'app-add-addition',
  imports: [
    NgSelectComponent,
    PageHeader,
    DatePicker,
    ReactiveFormsModule,
    FormError,
    SharedConfirmDialog,
    onlyNumberDirective,
  ],
  templateUrl: './add-addition.html',
  styleUrl: './add-addition.scss',
})
export class AddAddition extends FormComponentBase implements OnInit, OnDestroy {
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _payrollAdjustmentService = inject(PayrollAdjustmentService);
  private readonly _employeeService = inject(EmployeeService);
  private readonly _messageService = inject(MessageService);

  

  additionsList = [
    { name: 'مكافأه', id: EmployeeAdditionsTypes.Bonuses },
    { name: 'خصم', id: EmployeeAdditionsTypes.Deductions },
    { name: 'جزاء', id: EmployeeAdditionsTypes.Penalties },
    { name: 'سلفة', id: EmployeeAdditionsTypes.Advances },
  ];

  selectedEmployeeId: number | null = null;
  adjustmentsTable: PayrollAdjustmentModel[] = [];
  showDeleteDialog = false;

  employeeDisplay = {
    employeeId: '',
    employeeName: '',
    departmentName: '',
    phoneNumber: '',
    nationalIdOrIqamaNumber: '',
    gender: '',
    nationality: '',
    baseSalary: '',
  };

  employeeForm = this._fb.group({
    employeeSearch: [''],
  });

  adjustmentForm = this._fb.group({
    type: [null as EmployeeAdditionsTypes | null, [Validators.required]],
    amount: ['', [Validators.required]],
    adjustmentDate: [new Date(), [Validators.required]],
  });

  today = new Date();

  minDate = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    1
  );
  
  maxDate = new Date();
  // !!!!!!!!!1 Methods

  ngOnInit(): void {
    this.refreshActions();

    const employeeId = this._sharedStateService.selectedId$();
    if (employeeId) {
      this.loadEmployeeById(employeeId);
    }
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  searchEmployee(): void {
    const query = this.employeeForm.get('employeeSearch')?.value?.trim();
    if (!query) {
      return;
    }

    const employeeId = Number(query);
    if (Number.isNaN(employeeId)) {
      return;
    }

    this.loadEmployeeById(employeeId);
  }

  navigateEmployee(direction: 'prev' | 'next'): void {
    const currentValue = this.employeeForm.get('employeeSearch')?.value?.trim();
    const currentId = Number(currentValue);

    if (!currentValue || Number.isNaN(currentId)) {
      return;
    }

    const nextId =
      direction === 'prev' ? Math.max(1, currentId - 1) : currentId + 1;

    this.loadEmployeeById(nextId);
  }

  loadEmployeeById(id: number): void {
    this.employeeForm.patchValue({ employeeSearch: String(id) });
    (
      this._employeeService.getById(id) as unknown as Observable<EmployeeByIdResponse>
    )
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          if (!res.data) {
            this._messageService.add({
              severity: 'error',
              summary: 'خطأ',
              detail: 'لم يتم العثور على الموظف',
            });
            this.clearEmployeeDisplay();
            return;
          }

          this.selectEmployee(res.data);
        },
      });
  }

  selectEmployee(employee: EmployeeModel): void {
    this.selectedEmployeeId = employee.id;
    this.fillEmployeeDisplay(employee);
    this.employeeForm.patchValue({ employeeSearch: String(employee.id) });
    this.resetAdjustmentForm(false);
    this.loadAdjustmentsByEmployee(employee.id);
  }

  loadAdjustmentsByEmployee(employeeId: number): void {
    this._payrollAdjustmentService
      .getAllByEmployee(employeeId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.adjustmentsTable = this.extractAdjustments(res.data);
        },
      });
  }

  selectAdjustment(item: PayrollAdjustmentModel): void {
    this.changeButtonState(item.id, true);

    const adjustmentType = item.type ?? item.adjustmentType ?? null;
    const adjustmentDate = item.adjustmentDate ?? item.adjustmentDate;

    this.adjustmentForm.patchValue({
      type: adjustmentType as EmployeeAdditionsTypes | null,
      amount: item.amount != null ? String(item.amount) : '',
      adjustmentDate: adjustmentDate ? new Date(adjustmentDate) : new Date(),
    });
  }

  save(): void {
    if (this.selectedEmployeeId == null) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'الرجاء اختيار موظف',
      });
      return;
    }

    if (this.adjustmentForm.invalid) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    const formValue = this.adjustmentForm.getRawValue();
    const payload: any = {
      employeeId: this.selectedEmployeeId,
      type: formValue.type as EmployeeAdditionsTypes,
      amount: Number(formValue.amount),
      adjustmentDate: (formValue.adjustmentDate as Date).toISOString(),
    };

    if (!this.isEditMode) {
      this._payrollAdjustmentService
        .createPayrollAdjustment(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            this.changeButtonState(res.data, true);
            this.loadAdjustmentsByEmployee(this.selectedEmployeeId as number);
          },
        });
      return;
    }

    const updatePayload: PayrollAdjustmentUpdateModel = {
      id: this.idUpdate,
      ...payload,
    };

    this._payrollAdjustmentService
      .updatePayrollAdjustment(updatePayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
          this.loadAdjustmentsByEmployee(this.selectedEmployeeId as number);
        },
      });
  }

  // reset(): void {
  //   this.isEditMode = false;
  //   this.idUpdate = 0;
  //   this.resetAdjustmentForm(true);
  //   this.refreshActions();
  // }

  reset(): void {
    this.isEditMode = false;
    this.idUpdate = 0;
  
    this.employeeForm.reset({
      employeeSearch: '',
    });
  
    this.clearEmployeeDisplay();
  
    this.resetAdjustmentForm(false);
  
    this.refreshActions();
  }
  delete(): void {
    if (!this.idUpdate) {
      return;
    }
    this.showDeleteDialog = true;
  }

  deleteAdjustment(item: PayrollAdjustmentModel): void {

    /* this.showDeleteDialog = true;
    this._payrollAdjustmentService
      .deletePayrollAdjustment(item.id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });

          if (this.idUpdate === item.id) {
            this.reset();
          }

          if (this.selectedEmployeeId != null) {
            this.loadAdjustmentsByEmployee(this.selectedEmployeeId);
          }

          this.showDeleteDialog = false;
        },
      }); */

      this.idUpdate = item.id;
      this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this._payrollAdjustmentService
      .deletePayrollAdjustment(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          // this.reset();
          this.resetAdjustmentForm(true);
          if (this.selectedEmployeeId != null) {
            this.loadAdjustmentsByEmployee(this.selectedEmployeeId);
          }
        },
      });
  }

  print(): void {
    window.print();
  }

  getTypeLabel(item: PayrollAdjustmentModel): string {
    const type = item.type ?? item.adjustmentType;
    const found = this.additionsList.find((option) => option.id === type);
    return found?.name ?? '-';
  }

  getAmount(item: PayrollAdjustmentModel): string {
    return item.amount != null ? String(item.amount) : '-';
  }

  getDate(item: any): string {
    const value = item.adjustmentDate ?? item.adjustmentDate;
    if (!value) {
      return '-';
    }
    return value.split('T')[0];
  }

  private resetAdjustmentForm(clearEditState: boolean): void {
    if (clearEditState) {
      this.isEditMode = false;
      this.idUpdate = 0;
    }

    const currentDate =
    this.adjustmentForm.get('adjustmentDate')?.value ?? new Date();

    this.adjustmentForm.reset({
      type: null,
      amount: '',
      adjustmentDate: currentDate,
      // adjustmentDate: new Date(),
    });
    this.refreshActions();
  }

  private clearEmployeeDisplay(): void {
    this.selectedEmployeeId = null;
    this.adjustmentsTable = [];
    this.employeeDisplay = {
      employeeId: '',
      employeeName: '',
      departmentName: '',
      phoneNumber: '',
      nationalIdOrIqamaNumber: '',
      gender: '',
      nationality: '',
      baseSalary: '',
    };
  }

  private fillEmployeeDisplay(data: EmployeeModel): void {
    this.employeeDisplay = {
      employeeId: String(data.id),
      employeeName: data.name ?? '',
      departmentName: data.departmentName ?? '',
      phoneNumber: data.phoneNember ?? '',
      nationalIdOrIqamaNumber: data.nationalIdOrIqamaNumber ?? '',
      gender: '',
      nationality: data.nationality ?? '',
      baseSalary: String(data.salary ?? ''),
    };
  }

  private extractAdjustments(
    data: PayrollAdjustmentModel[] | { rows: PayrollAdjustmentModel[] }
  ): PayrollAdjustmentModel[] {
    if (Array.isArray(data)) {
      return data;
    }

    return data?.rows ?? [];
  }
}
