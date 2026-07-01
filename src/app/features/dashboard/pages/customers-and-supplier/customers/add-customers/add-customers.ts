import { ChangeDetectorRef, Component, DestroyRef, HostListener, inject, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatePicker } from 'primeng/datepicker';
import { Dialog } from 'primeng/dialog';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgStyle } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { EmailValidation } from '../../../../../../shared/validations/email';
import IntlTelInput from '@intl-tel-input/angular';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { OnlyStringDirective } from '../../../../../../shared/directives/only-string';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { Customers } from '../services/customers';
import { MessageService } from 'primeng/api';
import { BUTTON_CONFIG } from '../../../../../../shared/config/button-cofig';
import { customerType } from '../../../../../../shared/Enums/customer-type.enum';
import { CustSuppType } from '../../../../../../shared/Enums/custSupp-type.enum';
import { userNameValidation } from '../../../../../../shared/validations/user-name';
import { addressValidations } from '../../../../../../shared/validations/address';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { PdfPrinterComponent } from "../../../../../../shared/components/pdf-printer/pdf-printer";
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
@Component({
  selector: 'app-add-customers',
  imports: [
    PageHeader,
    NgSelectComponent,
    DatePicker,
    Dialog,
    AutoComplete,
    NgClass,
    NgStyle,
    IntlTelInput,
    ReactiveFormsModule,
    FormError,
    OnlyStringDirective,
    onlyNumberDirective,
    SharedConfirmDialog,
    PdfPrinterComponent
],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.scss',
})
export class AddCustomers extends FormComponentBase{
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _destroyRef = inject(DestroyRef);
  _customerService = inject(Customers);
  _messageServices = inject(MessageService);
  _sharedStateServices: SharedStateServices = inject(SharedStateServices);
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('phoneInput') phoneInput: any;
   @ViewChild('autoComplete') autoComplete!: AutoComplete;
   @ViewChild('printer') printer!: PdfPrinterComponent;
  date2: Date | undefined;
  showDeleteDialog = false;
  Company = customerType.Company;
  Individual = customerType.Individual;
  customer = CustSuppType.Customer;
  customerAndSupplier = CustSuppType.CustomerSupplier;
  
  explorerBtn = {
    label: 'مستكشف العملاء  ',
    link: '/customers/explorer',
  };

  dataChecked = 'company';

  loadUtils = () => import('intl-tel-input/utils');

  items:any[] = [];

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  customerForm = this._fb.group({
    custSuppType: [this.customerAndSupplier, Validators.required],

    customerType: [this.Company, Validators.required],

    customerCode: [{ value: '0', disabled: true }],

    nameAr: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),userNameValidation()]],

    nameEn: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100),userNameValidation()]],

    phoneNumber: ['', [Validators.required, egyptSaudiPhoneValidator]],

    phoneCountryCode: ['+966', [Validators.required]],

    email: ['', [Validators.required, EmailValidation]],

    creditWarningLimit: [
      null,
      [
        // Validators.min(0),
        Validators.required,
        Validators.maxLength(12),
      ],
    ],

    creditLimit: [
      null,
      [
        // Validators.min(0),
        Validators.required,
        Validators.maxLength(12),
      ],
    ],

    idTypeId: [null, Validators.required],

    idNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(14)]],

    taxNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15)]],

    notes: ['', [Validators.minLength(3), Validators.maxLength(200)]],

    simpleAddress: [''],

    address: this._fb.group({
      country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      buildingNumber: ['', [Validators.required, Validators.maxLength(10)]],
      postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
    }),
  });

  commercialRegister = [
    {
      id: 1,
      name: 'رقم السجل التجارى',
    },
    {
      id: 2,
      name: 'رخصة وزارة الشؤون البلدية والقروية والإسكان',
    },
    {
      id: 3,
      name: 'رخصة وزارة الموارد البشرية والتنمية الاجتماعية',
    },
    {
      id: 4,
      name: 'رخصة وزارة الاستثمار',
    },
    {
      id: 5,
      name: 'معرف آخر',
    },
  ];

  showSearchBox: boolean = false;
  selectedSearch = 'الكود';

  idResultSearch: number = 0;
  pageIndex = 1;
  pageSize = 10;
  selectedSearchType:'code' | 'name' | 'mobile' = 'code';
   searchControl = new FormControl('',Validators.required);
  cdr = inject(ChangeDetectorRef);
  // !!!!!!!!!!!!!!! Methods
  updateSimpleAddressValidation(type: number | any) {
    const simple = this.customerForm.get('simpleAddress');
    const address = this.customerForm.get('address');

    if (type === 1) {
      // 👤 فرد
      address?.reset({ emitEvent: false });
      address?.disable({ emitEvent: false });

      simple?.enable({ emitEvent: false });
      simple?.setValidators([
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(200),
        addressValidations(),

      ]);
      simple?.updateValueAndValidity({ emitEvent: false });
    } else {
      const addressGroup = this.customerForm.get('address') as any;

      simple?.reset();
      simple?.clearValidators();
      simple?.disable({ emitEvent: false });
      simple?.updateValueAndValidity({ emitEvent: false });

      addressGroup.enable({ emitEvent: false });

      // شيل أي validators قديمة الأول
      addressGroup.setValidators(null);
      addressGroup.updateValueAndValidity({ emitEvent: false });

      // رجّع required لكل الحقول
      Object.keys(addressGroup.controls).forEach((key) => {
        const control = addressGroup.get(key);
        control?.setValidators([Validators.required]);
        control?.updateValueAndValidity({ emitEvent: false });
      });

      addressGroup.updateValueAndValidity({ emitEvent: false });
    }
  }
  ngOnInit(): void {
    this.customerForm
      .get('nameAr')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        this.customerForm.get('nameEn')?.setValue(value, {
          emitEvent: false,
        });
      });

    this.customerForm
      .get('customerType')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((type: any) => {
        this.updateSimpleAddressValidation(type);
      });
    this.refreshActions();
    this.loadCustomer();
  }

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const targetElement = event.target.closest('.search_input') as HTMLElement;
    if (!targetElement) {
      this.showSearchBox = false;
    }
  }


  loadCustomer() {
   const id:any=this._sharedStateServices.selectedId$();
   if(id){
    this._customerService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
        if(res.data.customerType == 1){
        this.dataChecked = 'client';
      }else{
        this.dataChecked = 'company';
      }
      this.updateSimpleAddressValidation(res.data.customerType);
      this.customerForm.patchValue({
        ...res.data,
        customerCode: res.data.code,
        nameAr: res.data.name,
        nameEn: res.data.name,
        idTypeId: res.data.idType
      });
      this.addressForm.patchValue({
        ...res.data
      })
      this.changeButtonState(res.data.id,true);
  


const iti = this.phoneInput?.iti;

if (iti) {
  switch (res.data.phoneCountryCode) {
    case '+20':
      iti.setCountry('eg');
      break;

    case '+966':
      iti.setCountry('sa');
      break;

    case '+971':
      iti.setCountry('ae');
      break;
  }
}
      
      this.changeButtonState(res.data.id,true);
      this.refreshActions();

    })
   }

    
  }

      get addressForm(): FormGroup {
  return this.customerForm.get('address') as FormGroup;
}
      onEnter(event: any) {
  if (this.searchControl.invalid) {
    this._messageServices.add({
      severity: 'error',
      summary: 'خطأ',
      detail: `يجب ادخال قيمه بحث ${this.selectedSearch}`,
    })
    return;
  }
  // نفذ البحث هنا
}

  search(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').trim();

    if (!query) {
      this.items = [];
      this.idResultSearch = 0;
      return;
    }

    console.log('id Result Search', this.idResultSearch);


    let enumSearch: SearchableColumnEnum;

switch(this.selectedSearchType){

  case 'code':
    enumSearch = SearchableColumnEnum.Code;
    break;

  case 'name':
    enumSearch = SearchableColumnEnum.NameEn;
    break;

  case 'mobile':
    enumSearch = SearchableColumnEnum.Phone;
    break;
}
    const payload = buildSearchPayload(query, this.pageSize, enumSearch);

    this._customerService
      .search(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
    //       this.items = res.data.rows.map((item: any) => ({
    //         label: item.name,
    //         value: item.id,
    //       }));

    //       this.cdr.detectChanges();
    //             // setTimeout(() => {
    // this.autoComplete.show();
  // },200);


   this.items = [...res.data.rows.map((item:any) => ({
    label: item.name,
    value: item.id,
  }))];

  requestAnimationFrame(() => {
    this.autoComplete.show();
  });

        },
      });
  }

  selectFilterSearch(type: 'mobile' | 'name' | 'code') {
      this.selectedSearchType = type;
    if (type == 'name') {
      this.selectedSearch = 'الأسم';
     
    } else if (type == 'mobile') {
      this.selectedSearch = 'رقم الجوال';
     
    } else if (type == 'code') {
      this.selectedSearch = 'الكود';
    } 
    this.showSearchBox = false;
  }


   onSelectDelegate(event: any) {
  const delegateId = event.value.value;


  this._customerService
    .getById(delegateId)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(res => {
      // console.log(res);
      // this.idUpdate = res.data.id;
      console.log(res.data);
// asdasdasd
      if(res.data.customerType == 1){
        this.dataChecked = 'client';
      }else{
        this.dataChecked = 'company';
      }
      this.updateSimpleAddressValidation(res.data.customerType);
      this.customerForm.patchValue({
        ...res.data,
        nameAr: res.data.name,
        nameEn: res.data.name,
        idTypeId: res.data.idType
      });
      // this..patchValue({
        // ...res.data
      // })
      this.changeButtonState(res.data.id,true);
      // this..nativeElement.value = res.data.id;
      this.customerForm.get('customerCode')?.setValue(res.data.code);


const iti = this.phoneInput?.iti;

if (iti) {
  switch (res.data.phoneCountryCode) {
    case '+20':
      iti.setCountry('eg');
      break;

    case '+966':
      iti.setCountry('sa');
      break;

    case '+971':
      iti.setCountry('ae');
      break;
  }
}
         this.searchControl.reset();
      this.items = [];
    });
}
  changeChecked(event: any) {
    const checked = event.target.checked;
    const label = event.target.getAttribute('data-label');
    this.dataChecked = label;
  }

  onPhoneChange(event: any) {
    const number = event?.target?.value;
    if (!number) return;

    this.customerForm.get('phoneNumber')?.setValue(number, {
      emitEvent: false,
    });
  }

  onCountryChange() {
    const iti = this.phoneInput?.iti;

    if (!iti) return;

    const country = iti.getSelectedCountryData();

    const dialCode = country?.dialCode;

    this.customerForm.patchValue({
      phoneCountryCode: dialCode ? '+' + dialCode : '',
    });
  }


  save() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }
    const raw = this.customerForm.getRawValue();

    let payload: any;

    if (raw.customerType === 1) {
      payload = {
        ...raw,
        address: null,
      };
    } else {
      payload = {
        ...raw,
        simpleAddress: null,
      };
    }

    if (this.isEditMode === false) {
      this._customerService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم الحفظ بنجاح',
            });

            this.updateSimpleAddressValidation(this.customerForm.get('customerType')?.value);
            // this.idUpdate = res.data.id;
            this.changeButtonState(res.data.id,true);

            this.customerForm.get('customerCode')?.setValue(res.data.code);
            this.refreshActions();
          },
        });
    } else {
      this._customerService
        .update(payload, this.idUpdate)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم التحديث بنجاح',
            });
            this.updateSimpleAddressValidation(this.customerForm.get('customerType')?.value);
            this.refreshActions();
          },
        });
    }
  }

  reset() {
    this.customerForm.reset({
      custSuppType: this.customerAndSupplier,
      customerType: this.Company,
      phoneCountryCode: '+966',
    });
    this.searchControl.reset();
this.items = [];
this.autoComplete.hide();    
this.changeButtonState(0, false);
    this.refreshActions();
  }

  delete() {
    this.showDeleteDialog = true;
  }

  deleteDialog() {
    this._customerService
      .delete(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this._messageServices.add({
            severity: 'success',
            summary: 'Success',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.reset();
        },
      });
  }

  print() {
    // console.log('Print action triggered');
    this.printer.print();
  }


getCombinedData() {
  return {
    ...this.customerForm.value,

    custSuppTypeName: this.customerForm.value.custSuppType
      ? 'عملاء وموردين'
      : 'عميل',

    customerTypeName:
      this.customerForm.value.customerType === this.Company
        ? 'شركة'
        : 'فرد',

        customerCode: this.customerForm.value.customerCode,
     

    
  };
}
  
}
