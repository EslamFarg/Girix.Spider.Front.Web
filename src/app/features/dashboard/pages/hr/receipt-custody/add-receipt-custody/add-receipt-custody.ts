import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { MessageService } from 'primeng/api';
import { DatePicker } from 'primeng/datepicker';
import { Observable } from 'rxjs';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { EmployeeByIdResponse, EmployeeModel } from '../../employees/model/employee';
import { EmployeeService } from '../../employees/services/employee-service';
import { CustodyDropdownItem } from '../../custody/models/custody';
import { CustodyService } from '../../custody/services/custody-service';
import {
  CustodyReceiptCreateModel,
  CustodyReceiptDetailModel,
  CustodyReceiptUpdateModel,
} from '../models/custody-receipt';
import { CustodyReceiptService } from '../services/custody-receipt-service';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-add-receipt-custody',
  imports: [
    DatePicker,
    NgSelectComponent,
    PageHeader,
    ReactiveFormsModule,
    FormError,
    SharedConfirmDialog,
    onlyNumberDirective,
    PageHeaderSearch
],
  templateUrl: './add-receipt-custody.html',
  styleUrl: './add-receipt-custody.scss',
})
export class AddReceiptCustody extends FormComponentBase implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _custodyReceiptService = inject(CustodyReceiptService);
  private readonly _custodyService = inject(CustodyService);
  private readonly _employeeService = inject(EmployeeService);
  private readonly _messageService = inject(MessageService);

  explorerBtn = {
    label: 'مستكشف  استلام عهدة  ',
    link: '/hr/receipt-custody/explorer',
  };

  custodyItems: CustodyDropdownItem[] = [];
  selectedEmployeeId: number | null = null;
  showDeleteDialog = false;
  visible = false;

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

  receiptForm = this._fb.group({
    employeeSearch: [''],
    custodyId: [null as number | null, [Validators.required]],
    amount: ['', [Validators.required]],
    date: [new Date(), [Validators.required]],
  });

  ngOnInit(): void {
    this.loadCustodyItems();
    this.refreshActions();

    const selectedId = this._sharedStateService.selectedId$();
    if (selectedId) {
      this.loadReceiptById(selectedId);
    }
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
  }

  loadCustodyItems(): void {
    this._custodyService
      .getAllCustodyOptions()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.custodyItems = (res.data?.rows ?? []).map((item) => ({
            id: item.id,
            name: item.name ?? item.custodyName ?? item.custodyTypeName ?? '',
          }));
        },
      });
  }

  loadReceiptById(id: number): void {
    this._custodyReceiptService
      .getCustodyReceiptById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          const data = res.data;
          if (!data) {
            return;
          }

          this.changeButtonState(data.id, true);
          this.receiptForm.patchValue({
            custodyId: data.custodyId ?? null,
            amount: data.amount != null ? String(data.amount) : '',
            date: data.receiptDate
              ? new Date(data.receiptDate)
              : data.date
                ? new Date(data.date)
                : new Date(),
          });

          if (data.employeeId) {
            this.loadEmployeeById(data.employeeId);
          }
        },
      });
  }

  searchEmployee(): void {
    const query = this.receiptForm.get('employeeSearch')?.value?.trim();
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
    const currentValue = this.receiptForm.get('employeeSearch')?.value?.trim();
    const currentId = Number(currentValue);

    if (!currentValue || Number.isNaN(currentId)) {
      return;
    }

    const nextId =
      direction === 'prev' ? Math.max(1, currentId - 1) : currentId + 1;

    this.loadEmployeeById(nextId);
  }

  loadEmployeeById(id: number): void {
    this.receiptForm.patchValue({ employeeSearch: String(id) });

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
    this.receiptForm.patchValue({
      employeeSearch: String(employee.id),
    });
  }

  clearEmployeeDisplay(): void {
    this.selectedEmployeeId = null;
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

  fillEmployeeDisplay(data: EmployeeModel | CustodyReceiptDetailModel): void {
    if (this.isEmployeeModel(data)) {
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
      return;
    }

    this.employeeDisplay = {
      employeeId: String(data.employeeId),
      employeeName: data.employeeName ?? data.name ?? '',
      departmentName: data.departmentName ?? '',
      phoneNumber: data.phoneNumber ?? '',
      nationalIdOrIqamaNumber: data.nationalIdOrIqamaNumber ?? '',
      gender: data.gender ?? '',
      nationality: data.nationality ?? '',
      baseSalary: String(data.baseSalary ?? data.salary ?? ''),
    };
  }

  private isEmployeeModel(
    data: EmployeeModel | CustodyReceiptDetailModel
  ): data is EmployeeModel {
    return 'phoneNember' in data || 'nameAr' in data;
  }

  save(): void {
    if (this.receiptForm.invalid || this.selectedEmployeeId == null) {
      this.receiptForm.markAllAsTouched();
      if (this.selectedEmployeeId == null) {
        this._messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'الرجاء اختيار موظف',
        });
      }
      return;
    }

    const formValue = this.receiptForm.getRawValue();
    const payload: CustodyReceiptCreateModel = {
      employeeId: this.selectedEmployeeId,
      custodyId: formValue.custodyId as number,
      amount: Number(formValue.amount),
      receiptDate: (formValue.date as Date).toISOString(),
    };

    if (!this.isEditMode) {
      this._custodyReceiptService
        .createCustodyReceipt(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              severity: 'success',
              summary: 'نجاح',
              detail: 'تم الاضافة بنجاح',
            });
            this.changeButtonState(res.data, true);
          },
        });
      return;
    }

    const updatePayload: CustodyReceiptUpdateModel = {
      id: this.idUpdate,
      ...payload,
    };

    this._custodyReceiptService
      .updateCustodyReceipt(updatePayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم التعديل بنجاح',
          });
        },
      });
  }

  reset(): void {
    this.isEditMode = false;
    this.idUpdate = 0;
    this.selectedEmployeeId = null;
    this.receiptForm.reset({
      employeeSearch: '',
      custodyId: null,
      amount: '',
      date: new Date(),
    });
    this.clearEmployeeDisplay();
    this._sharedStateService.clearSelectedId();
    this.refreshActions();
  }

  delete(): void {
    if (!this.idUpdate) {
      return;
    }
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    this._custodyReceiptService
      .deleteCustodyReceipt(this.idUpdate)
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

  assignCustodyToEmployee(employeeId: number): void {
    if (!this.idUpdate) {
      return;
    }

    this._custodyService
      .assignCustodyToEmployee({ id: this.idUpdate, employeeId })
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم تسليم العهدة للموظف بنجاح',
          });
          this.visible = false;
        },
      });
  }
}
