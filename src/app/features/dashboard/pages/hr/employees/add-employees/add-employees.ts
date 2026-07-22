import { Component, ChangeDetectorRef, DestroyRef, ElementRef, forwardRef, inject, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Dialog } from 'primeng/dialog';
import { InputAttachment } from '../../../../../../shared/ui/input-attachment/input-attachment';
import { FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { SectionsService } from '../../sections/services/sections-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AllowancesService } from '../../allowances/services/allowances';
import { AttachmentManagerComponent } from "../../../../../../shared/ui/attachment-manager/attachment-manager";
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import IntlTelInput from '@intl-tel-input/angular';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { NgClass } from '@angular/common';
import { EmployeeService } from '../services/employee-service';
import { MessageService } from 'primeng/api';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { env } from 'node:process';
import { environment } from '../../../../../../../environments/environment.development';
import { LanguageNameValidator } from '../../../../../../shared/validations/language-name-validators';

@Component({
  selector: 'app-add-employees',
  imports: [
    RouterLink,
    DatePicker,
    NgSelectComponent,
    Dialog,
    InputAttachment,
    ReactiveFormsModule,
    AttachmentManagerComponent,
    FormError, onlyNumberDirective,
    IntlTelInput,
    NgClass,
    SharedConfirmDialog
],
  templateUrl: './add-employees.html',
  styleUrl: './add-employees.scss',
})
export class AddEmployees extends FormComponentBase {
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  @ViewChild('inputSearch') inputSearch!: ElementRef<HTMLInputElement>;
  formAttachment = this._fb.group({
    attachment: [''],
  });
  _sectionsService = inject(SectionsService);
  _destroyRef: DestroyRef = inject(DestroyRef);
  _AllowancesServices = inject(AllowancesService);
  _employeeService = inject(EmployeeService);
  _messageService:MessageService = inject(MessageService);
  private readonly _cdr = inject(ChangeDetectorRef);
  
  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
  visible: boolean = false;
  visibleReject: boolean = false;
  items = [];
  showDeleteDialog=false;
   loadUtils = () => import('intl-tel-input/utils');

  AllowancesList = [];
  employeeForm = this._fb.group({
  id:[null],
  employeeNumber: [
    '',
    [Validators.required, Validators.maxLength(40)]
  ],

  baseNember: [
    '',
    [Validators.required,Validators.maxLength(40)]
  ],

  allowancesIds: this._fb.control([], [Validators.required]),

  salary: [
    null,
    [Validators.required]
  ],

  departmentId: [
    null,
    [Validators.required]
  ],

  nameAr: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
      entityNameValidator(),
      LanguageNameValidator.arabicOnly()
    ]
  ],

  nameEn: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
      entityNameValidator(),
      LanguageNameValidator.englishOnly()
    ]
  ],

  phoneNember: [
    '',
    [
      Validators.required,
      egyptSaudiPhoneValidator
    ]
  ],

  image: [
    null,
    [Validators.required] as any
  ],

  nationalIdOrIqamaNumber: [
    '',
    [Validators.required,Validators.minLength(10),Validators.maxLength(14)]
  ],

  nationalIdOrIqamaNumberFile: [
    null
  ],

  medicalInsuranceDate: [
    new Date(),
    [Validators.required]
  ],

  medicalInsuranceFile: [
    null
  ],

  iban: [
    '',
    [Validators.required]
  ],

  bankAttachmentFile: [
    null
  ],

  passportNumber: [
    '',
  ],

  passportAttachment: [
    null
  ],

  borderNumber: [
    ''
  ],

  borderAttachment: [
    null
  ],

  nationality: [
    '',
    [Validators.required,Validators.minLength(3),Validators.maxLength(50),entityNameValidator()]
  ],

  jobTitle: [
    '',
    [Validators.required,Validators.minLength(3),Validators.maxLength(50),entityNameValidator()]
  ],

  dateOfBirth: [
    new Date(),
    [Validators.required]
  ],

  workStartDate: [
    new Date(),
    [Validators.required]
  ],

  returnFromLeaveDate: [
    new Date()
  ],

  contractEndDate: [
    new Date()
    // new Date(new Date().getDate() + 1,new Date().setFullYear(new Date().getFullYear() + 1)),
  ],

  contractEndAttachmentFile: [
    null
  ],

  address: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(500),
      entityNameValidator()
    ]
  ]
});

accountExlorer:any=[]
sectionsData:any[]=[]
pageSize = 20;
offset = 0;

loading = false;
hasMore = true;

contractEndPickerKey = 0;

// !!!!!!!!!!!!!!! Server Attachments Previews
attachmentsPreviews = {
  nationalIdOrIqamaNumberFile: null as string | null,
  medicalInsuranceFile: null as string | null,
  bankAttachmentFile: null as string | null,
  passportAttachment: null as string | null,
  borderAttachment: null as string | null,
  contractEndAttachmentFile: null as string | null,
};

  // !!!!!!!!!!!!!!! Methods



//  constructor() {

// }
  ngOnInit() {
    this.getAllDataSections();
    this.getAllAllowances();
    this.loadEmployeeCommingFromExplorer();
    this.refreshActions();
    this.setupContractEndDateValidation();
  }

  private setupContractEndDateValidation(): void {
    this.syncContractEndDateMin(this.employeeForm.get('workStartDate')?.value);

    this.employeeForm
      .get('contractEndDate')
      ?.addValidators((control) => this.validateContractEndDate(control));

    this.employeeForm
      .get('workStartDate')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.onWorkStartDateChange();
      });
  }

  get contractEndMinDate(): Date {
    return this.buildMinContractEndDate(
      this.employeeForm.get('workStartDate')?.value,
    );
  }

  onWorkStartDateChange(): void {
    setTimeout(() => {
      this.syncContractEndDateMin(this.employeeForm.get('workStartDate')?.value);
      this.contractEndPickerKey++;
      this.employeeForm.get('contractEndDate')?.updateValueAndValidity();
      this._cdr.detectChanges();
    });
  }

  onContractEndDateChange(): void {
    setTimeout(() => {
      this.enforceContractEndDate(true);
    });
  }

  private enforceContractEndDate(showMessage: boolean): void {
    const endControl = this.employeeForm.get('contractEndDate');
    const startDate = this.employeeForm.get('workStartDate')?.value;
    const endDate = endControl?.value;
    const minEndDate = this.buildMinContractEndDate(startDate);

    if (!this.isDateBefore(endDate, minEndDate)) {
      endControl?.updateValueAndValidity({ emitEvent: false });
      return;
    }

    endControl?.setValue(new Date(minEndDate), { emitEvent: false });
    endControl?.updateValueAndValidity({ emitEvent: false });
    endControl?.markAsTouched();
    endControl?.markAsDirty();

    if (showMessage) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'تاريخ إنهاء العقد يجب أن يكون بعد تاريخ مباشرة العمل',
      });
    }

    this._cdr.detectChanges();
  }

  private buildMinContractEndDate(
    startDate: Date | string | null | undefined,
  ): Date {
    const base = this.normalizeDate(startDate) ?? this.normalizeDate(new Date())!;
    return new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1);
  }

  private normalizeDate(
    value: Date | string | null | undefined,
  ): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private toDateKey(value: Date | string | null | undefined): string | null {
    const date = this.normalizeDate(value);
    if (!date) {
      return null;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private isDateBefore(
    value: Date | string | null | undefined,
    minValue: Date | string | null | undefined,
  ): boolean {
    const valueKey = this.toDateKey(value);
    const minKey = this.toDateKey(minValue);
    return !!valueKey && !!minKey && valueKey < minKey;
  }

  private syncContractEndDateMin(
    startDate: Date | string | null | undefined,
  ): void {
    const endControl = this.employeeForm.get('contractEndDate');
    const minEndDate = this.buildMinContractEndDate(startDate);

    if (this.isDateBefore(endControl?.value, minEndDate)) {
      endControl?.setValue(new Date(minEndDate), { emitEvent: false });
      endControl?.setErrors({ minContractEndDate: true });
      endControl?.markAsTouched();
    }
  }

  private validateContractEndDate(
    control: AbstractControl,
  ): ValidationErrors | null {
    const minEndDate = this.buildMinContractEndDate(
      this.employeeForm.get('workStartDate')?.value,
    );

    return this.isDateBefore(control.value, minEndDate)
      ? { minContractEndDate: true }
      : null;
  }



  getAllDataSections(){
     if (this.loading || !this.hasMore) return;
    this.loading = true;
    this._sectionsService.getAllSendInQuery(this.offset,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      // this.sectionsData=res.data.rows
         const rows = res.data.rows;

        this.sectionsData = [...this.sectionsData, ...rows];

        // لو رجع أقل من 20 يبقى مفيش بيانات تاني
        if (rows.length < this.pageSize) {
          this.hasMore = false;
        }

        this.loading = false;
     
    })
  }

  getAllAllowances(){
    return this._AllowancesServices.getAllSendInQuery(0,0).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.AllowancesList=res.data.rows
    })
  }

loadEmployeeCommingFromExplorer() {
  const id = this._sharedStateService.selectedId$();

  if(id){
    this._employeeService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.fillForm(res.data);
    })
  }
    
}

 



searchEmployee(val: any) {



  if(!val){
    // this._messageService.add({
    //   severity: 'error',
    //   summary: 'خطأ',
    //   detail: 'يجب أن يكون هذا الحقل فارغ'
    // });
     return;
  } 

  this._employeeService.getById(val).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this.fillForm(res.data);
    }
  })
}


fillForm(data: any) {

  this.employeeForm.patchValue({
    id: data.id,
    employeeNumber: data.employeeNumber,
    baseNember: data.baseNember,
    allowancesIds:  data.allowances?.map((x: any) => x.id) ?? [],
    salary: data.salary,
    departmentId: data.departmentId,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    phoneNember: data.phoneNember,
    nationalIdOrIqamaNumber: data.nationalIdOrIqamaNumber,
    iban: data.iban,
    passportNumber: data.passportNumber,
    borderNumber: data.borderNumber,
    nationality: data.nationality,
    jobTitle: data.jobTitle,
    address: data.address,
    
    medicalInsuranceDate: data.medicalInsuranceDate ? new Date(data.medicalInsuranceDate) : null,
    dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
    workStartDate: data.workStartDate ? new Date(data.workStartDate) : null,
    returnFromLeaveDate: data.returnFromLeaveDate ? new Date(data.returnFromLeaveDate) : null,
    contractEndDate: data.contractEndDate ? new Date(data.contractEndDate) : null,

    image:data.imageUrl ? data.imageUrl : null,
    nationalIdOrIqamaNumberFile: data.nationalIdOrIqamaNumberUrl ?   data.nationalIdOrIqamaNumberUrl : null,
    medicalInsuranceFile: data.medicalInsuranceFileUrl ? data.medicalInsuranceFileUrl : null,
    bankAttachmentFile: data.bankAttachmentUrl ? data.bankAttachmentUrl : null,
    passportAttachment: data.passportAttachmentUrl ? data.passportAttachmentUrl : null,
    borderAttachment: data.borderAttachmentUrl ? data.borderAttachmentUrl : null,
    contractEndAttachmentFile: data.contractEndAttachmentUrl ? data.contractEndAttachmentUrl : null
  });

  this.syncContractEndDateMin(this.employeeForm.get('workStartDate')?.value);
  this.contractEndPickerKey++;
  this.employeeForm.get('contractEndDate')?.updateValueAndValidity();


  if (data.imageUrl) {
    this.imagePreviewProfile = environment.baseUrl+'/' + data.imageUrl;
  }


  const base = environment.baseUrl;
  this.attachmentsPreviews = {
    nationalIdOrIqamaNumberFile: data.nationalIdOrIqamaNumberFile ? base + data.nationalIdOrIqamaNumberFile : null,
    medicalInsuranceFile: data.medicalInsuranceFile ? base + data.medicalInsuranceFile : null,
    bankAttachmentFile: data.bankAttachmentFile ? base + data.bankAttachmentFile : null,
    passportAttachment: data.passportAttachment ? base + data.passportAttachment : null,
    borderAttachment: data.borderAttachment ? base + data.borderAttachment : null,
    contractEndAttachmentFile: data.contractEndAttachmentFile ? base + data.contractEndAttachmentFile : null,
  };

  this.changeButtonState(data.id, true);
}

  loadMoreSections() {

  if (!this.hasMore) return;

  this.offset += this.pageSize;

  this.getAllDataSections();
}

formatDate(date: Date | string): string {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

  save() {
    this.enforceContractEndDate(false);
    this.employeeForm.get('contractEndDate')?.updateValueAndValidity();

    if(this.employeeForm.invalid){
      this.employeeForm.markAllAsTouched();

      if (this.employeeForm.get('contractEndDate')?.hasError('minContractEndDate')) {
        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: 'تاريخ إنهاء العقد يجب أن يكون بعد تاريخ مباشرة العمل',
        });
      }

      return;
    }
      const formData = new FormData();
  const formValue = this.employeeForm.value;

  // القيم العادية
  formData.append('employeeNumber', formValue.employeeNumber ?? '');
  formData.append('baseNember', formValue.baseNember ?? '');
  formData.append('salary', String(formValue.salary ?? ''));
  formData.append('departmentId', String(formValue.departmentId ?? ''));
  formData.append('nameAr', formValue.nameAr ?? '');
  formData.append('nameEn', formValue.nameEn ?? '');
 
  formData.append('phoneNember', formValue.phoneNember ?? '');
  formData.append('nationalIdOrIqamaNumber', formValue.nationalIdOrIqamaNumber ?? '');
  formData.append('iban', formValue.iban ?? '');
  formData.append('passportNumber', formValue.passportNumber ?? '');
  formData.append('borderNumber', formValue.borderNumber ?? '');
  formData.append('nationality', formValue.nationality ?? '');
  formData.append('jobTitle', formValue.jobTitle ?? '');
  formData.append('address', formValue.address ?? '');

  // التواريخ
  if (formValue.medicalInsuranceDate) {
    formData.append(
      'medicalInsuranceDate',
      this.formatDate(formValue.medicalInsuranceDate)
    );
  }

  if (formValue.dateOfBirth) {
    formData.append(
      'dateOfBirth',
      this.formatDate(formValue.dateOfBirth)
    );
  }

  if (formValue.workStartDate) {
    formData.append(
      'workStartDate',
      this.formatDate(formValue.workStartDate)
    );
  }

  if (formValue.returnFromLeaveDate) {
    formData.append(
      'returnFromLeaveDate',
      this.formatDate(formValue.returnFromLeaveDate)
    );
  }

  if (formValue.contractEndDate) {
    formData.append(
      'contractEndDate',
      this.formatDate(formValue.contractEndDate)
    );
  }

  // الـ Array
  formValue.allowancesIds?.forEach((id: number) => {
    formData.append('allowancesIds', String(id));
    // أو allowancesIds[] حسب الـ API
  });

  // الملفات
  if (formValue.image) {
    formData.append('image', formValue.image);
  }

  if (formValue.nationalIdOrIqamaNumberFile) {
    formData.append(
      'nationalIdOrIqamaNumberFile',
      formValue.nationalIdOrIqamaNumberFile
    );
  }

  if (formValue.medicalInsuranceFile) {
    formData.append(
      'medicalInsuranceFile',
      formValue.medicalInsuranceFile
    );
  }

  if (formValue.bankAttachmentFile) {
    formData.append(
      'bankAttachmentFile',
      formValue.bankAttachmentFile
    );
  }

  if (formValue.passportAttachment) {
    formData.append(
      'passportAttachment',
      formValue.passportAttachment
    );
  }

  if (formValue.borderAttachment) {
    formData.append(
      'borderAttachment',
      formValue.borderAttachment
    );
  }

  if (formValue.contractEndAttachmentFile) {
    formData.append(
      'contractEndAttachmentFile',
      formValue.contractEndAttachmentFile
    );
  }

  // لو تعديل
  if (this.isEditMode && formValue.id) {
    formData.append('id', String(formValue.id));
  }
    if(this.isEditMode == false){
      this._employeeService.create(formData).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res:any)=>{
          this.employeeForm.patchValue({
            id:res.data
          })
          this._messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم حفظ الموظف بنجاح'
          });
          this.changeButtonState(res.data, true);
        }
      })
    }else{
      this._employeeService.updateWithOutPathParameter(formData).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res:any)=>{
          this._messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تعديل الموظف بنجاح'
          });
        }
      })

    }
  }

  resetFileName=false;
  reset() {
  this.employeeForm.reset({
    medicalInsuranceDate: new Date(),
    dateOfBirth: new Date(),
    workStartDate: new Date(),
    returnFromLeaveDate: new Date(),
    contractEndDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    ),
  });

  this.syncContractEndDateMin(this.employeeForm.get('workStartDate')?.value);

  this.profileImageSelected = null;
  this.imagePreviewProfile = null;
  
  // إعادة تعيين المرفقات
  this.attachmentsPreviews = {
    nationalIdOrIqamaNumberFile: null,
    medicalInsuranceFile: null,
    bankAttachmentFile: null,
    passportAttachment: null,
    borderAttachment: null,
    contractEndAttachmentFile: null,
  };

  

  this.isEditMode = false;
  this.idUpdate = 0;
  this.refreshActions();
}

  delete() {
    this.showDeleteDialog=true;
  }


  deleteDialog(){
    this._employeeService.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: 'تم حذف الموظف بنجاح'
        });
        this.showDeleteDialog=false;
        this.reset();
        this.refreshActions();
      }
    })
  }

  print() {
    console.log('Print action triggered');
  }

  showDialogReject() {
    this.visibleReject = true;
  }

  showDialog() {
    this.visible = true;
  }



  // !!!!!!!!!!!!!!! Profile Image

profileImageSelected: File | null = null;
imagePreviewProfile: string | null = null;

onFileChange(event: Event) {
  const input = event.target as HTMLInputElement;

  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];

  this.profileImageSelected = file;

  this.employeeForm.patchValue({
    image: file
  });
  const url = URL.createObjectURL(file);
  this.imagePreviewProfile = url;
}

removeImage() {
  this.profileImageSelected = null;
  this.imagePreviewProfile = null;
  this.employeeForm.patchValue({
    image: null
  });
}

  ngOnDestroy() {
    this._sharedStateService.clearSelectedId();
  }
}
