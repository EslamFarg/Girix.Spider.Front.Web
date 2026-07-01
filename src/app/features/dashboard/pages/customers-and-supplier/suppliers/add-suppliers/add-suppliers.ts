import { Component, DestroyRef, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { NgSelectComponent } from '@ng-select/ng-select';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustSuppType } from '../../../../../../shared/Enums/custSupp-type.enum';
import { customerType } from '../../../../../../shared/Enums/customer-type.enum';
import { userNameValidation } from '../../../../../../shared/validations/user-name';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import IntlTelInput from '@intl-tel-input/angular';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { EmailValidation } from '../../../../../../shared/validations/email';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { addressValidations } from '../../../../../../shared/validations/address';
import { Suppliers } from '../services/suppliers';
import { MessageService } from 'primeng/api';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { PdfPrinterComponent } from "../../../../../../shared/components/pdf-printer/pdf-printer";
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { NgClass } from '@angular/common';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';

@Component({
  selector: 'app-add-suppliers',
  imports: [PageHeader, NgSelectComponent, ReactiveFormsModule, FormError, IntlTelInput, onlyNumberDirective, SharedConfirmDialog, PdfPrinterComponent
    ,AutoCompleteModule,NgClass
  ],
  templateUrl: './add-suppliers.html',
  styleUrl: './add-suppliers.scss',
})
export class AddSuppliers extends FormComponentBase {
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _destroyRef:DestroyRef=inject(DestroyRef);
  _supplierServices = inject(Suppliers);
  _messageServices=inject(MessageService)
  _sharedStateServices=inject(SharedStateServices)
  

  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('phoneInput') phoneInput: any;
    @ViewChild('printer') printer!: PdfPrinterComponent;
    @ViewChild('searchBox') searchBoxElement!: ElementRef;
    Company = customerType.Company;
    Individual = customerType.Individual;
    customer = CustSuppType.Customer;
    customerAndSupplier = CustSuppType.CustomerSupplier;
    supplierEnum=CustSuppType.Supplier
     dataChecked = 'company';
    loadUtils = () => import('intl-tel-input/utils');
  supplierForm: FormGroup = this._fb.group({
     customerCode: [{ value: '', disabled: true }],
    customerType: [this.Company, Validators.required],
    nameAr: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),userNameValidation()]],
    nameEn: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100),userNameValidation()]],
    phoneNumber: ['', [Validators.required, egyptSaudiPhoneValidator]],
    phoneCountryCode: ['+20', Validators.required],
     email: ['', [Validators.required, EmailValidation]],
    creditLimit: [null,[   Validators.required,
        Validators.maxLength(12),]],
    creditWarningLimit: [null,[Validators.required ,
        Validators.maxLength(12)]],
    idTypeId: [null, [
         Validators.required,
    ]],
    custSuppType: [this.supplierEnum],
    idNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(14)]],
    // taxNumber: [''],
    taxNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15)]],
    notes: ['',[Validators.maxLength(500)]],
    simpleAddress: [''],

    address: this._fb.group({
          country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      buildingNumber: ['', [Validators.required, Validators.maxLength(10)]],
      postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
    })
  });  

  
    date2: Date | undefined;


  explorerBtn = {
    label: 'مستكشف الموردين  ',
    link: '/suppliers/explorer',
  };

  

  visible: boolean = false;
    showDeleteDialog = false;
pageSize = 10;
  showDialog() {
    this.visible = true;
  }

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

  //**  Search
   @ViewChild('autoComplete') autoComplete!: AutoComplete;
    searchControl = new FormControl('',Validators.required);
    showSearchBox = false;
  selectedSearch = 'الكود';
   SearchValEnum:any=SearchableColumnEnum.Code;
   selectedSearchType: 'code' | 'name' | 'mobile' = 'code';
  // !!!!!!!!!!!!!!! Methods


  @HostListener('document:click', ['$event'])

  clickout(event: any) {
    if (!this.searchBoxElement?.nativeElement?.contains(event.target)) {
    this.showSearchBox = false;
  }
  }
    updateSimpleAddressValidation(type: number | any) {
      const simple = this.supplierForm.get('simpleAddress');
      const address = this.supplierForm.get('address');
  
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
        const addressGroup = this.supplierForm.get('address') as any;
  
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

    get addressForm(): FormGroup {
  return this.supplierForm.get('address') as FormGroup;
}
  ngOnInit() {
     this.refreshActions();
    this.supplierForm.get('nameAr')?.valueChanges?.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((value) => {
      this.supplierForm.patchValue({
        nameEn: value
      },
      { emitEvent: false })
    })

      this.supplierForm
      .get('customerType')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((type: any) => {
        this.updateSimpleAddressValidation(type);
      });
      this.loadSupplier();
  }


   loadSupplier() {
   const id:any=this._sharedStateServices.selectedId$();
   if(id){
    this._supplierServices.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
        if(res.data.customerType == 1){
        this.dataChecked = 'client';
      }else{
        this.dataChecked = 'company';
      }
      this.updateSimpleAddressValidation(res.data.customerType);
      this.supplierForm.patchValue({
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

   onPhoneChange(event: any) {
    const number = event?.target?.value;
    if (!number) return;

    this.supplierForm.get('phoneNumber')?.setValue(number, {
      emitEvent: false,
    });
  }

  onCountryChange() {
    const iti = this.phoneInput?.iti;

    if (!iti) return;

    const country = iti.getSelectedCountryData();

    const dialCode = country?.dialCode;

    this.supplierForm.patchValue({
      phoneCountryCode: dialCode ? '+' + dialCode : '',
    });
  }

   changeChecked(event: any) {
    const checked = event.target.checked;
    const label = event.target.getAttribute('data-label');
    this.dataChecked = label;
  }

    // !!! Search
   items: any[] = [];
    value: any;


        selectFilterSearch(type: 'mobile' | 'name' | 'code' ) {
        this.selectedSearchType = type;
    if (type == 'name') {
      this.selectedSearch = 'الأسم';
      this.SearchValEnum=SearchableColumnEnum.Name
  
    } else if (type == 'mobile') {
      this.selectedSearch = 'رقم الجوال';
      this.SearchValEnum=SearchableColumnEnum.Phone

    }  else if (type == 'code') {
      this.selectedSearch = 'الكود';
      this.SearchValEnum=SearchableColumnEnum.Code
    } 
    this.showSearchBox = false;
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
      console.log('event', this.searchControl.value);
      const query = (event.query ?? '').trim();
      if(!query){
        this.items = [];
        return;
      }

        const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);

        this._supplierServices
          .search(payload)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
          
            next: (res: any) => {
              this.items = res.data.rows.map((item: any) => ({
                label: item.name,
                value: item.id,
              }));
               setTimeout(() => {
    this.autoComplete.show();
  });
            },
          });
    }


// dasdasd
  onSelectDelegate(event: any) {
  const delegateId = event.value.value;


  this._supplierServices
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
      this.supplierForm.patchValue({
        ...res.data,
        nameAr: res.data.name,
        nameEn: res.data.name,
        idTypeId: res.data.idType
      });
      this.addressForm.patchValue({
        ...res.data
      })
      this.changeButtonState(res.data.id,true);
      // this..nativeElement.value = res.data.id;
      this.supplierForm.get('customerCode')?.setValue(res.data.code);


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

  save() {
      if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    const raw = this.supplierForm.getRawValue();

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

    if (this.isEditMode==false) {
      this._supplierServices
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم الحفظ بنجاح',
            });

            // this.updateSimpleAddressValidation(this.supplierForm.get('customerType')?.value);
          
                this.changeButtonState(res.data.id,true);
            this.supplierForm.get('customerCode')?.setValue(res.data.code);
          
          },
        });
    } else {
      // Update

      this._supplierServices
        .update(payload, this.idUpdate)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageServices.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم التحديث بنجاح',
            });
              // this.changeButtonState(res.data.id,true);
          },
        });
    }
  }

  reset() {
    this.supplierForm.reset({
      customerCode:0,
      custSuppType: this.customerAndSupplier,
      customerType: this.Company,
      phoneCountryCode: '+966',
    });
    this.idUpdate = 0;
    this.isEditMode=false;
    this.refreshActions();
  }

  
  delete() {
    this.showDeleteDialog = true;
  }

  deleteDialog(){
   this._supplierServices.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
     next:(res:any)=>{
       this._messageServices.add({
         severity: 'success',
         summary: 'نجاح',
         detail: 'تم الحذف بنجاح',
       })
       this.showDeleteDialog=false;
       this.reset();
     }
   })
 }

  print() {
   this.printer.print();
  }

  //  getCombinedData() {
  //   return {
  //     ...this.supplierForm.value,
  //     code: this.supplierForm.get('customerCode')?.value || '0' // دمج الكود اللي بره الـ form group
  //   };
  // }

  getCombinedData() {
  const value = this.supplierForm.getRawValue();

  return {
      customerCode: value.customerCode,
      nameAr: value.nameAr,
      phoneNumber: value.phoneNumber,
      email: value.email,
      creditLimit: value.creditLimit,
      taxNumber: value.taxNumber,
      idNumber: value.idNumber,
      idTypeName: this.commercialRegister.find(x => x.id === value.idTypeId)?.name ?? ''
    }
  
}
  
}
