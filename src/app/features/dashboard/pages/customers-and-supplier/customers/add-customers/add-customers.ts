import { Component, DestroyRef, HostListener, inject, ViewChild } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { NgSelectComponent } from "@ng-select/ng-select";
import { DatePicker } from "primeng/datepicker";
import { Dialog } from "primeng/dialog";
import { AutoComplete, AutoCompleteCompleteEvent } from "primeng/autocomplete";
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgClass, NgStyle } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { EmailValidation } from '../../../../../../shared/validations/email';
import IntlTelInput from "@intl-tel-input/angular";
import "intl-tel-input/styles";
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { OnlyStringDirective } from "../../../../../../shared/directives/only-string";
import { onlyNumberDirective } from "../../../../../../shared/directives/only-number";
import { Customers } from '../services/customers';
import { MessageService } from 'primeng/api';
import { BUTTON_CONFIG } from '../../../../../../shared/config/button-cofig';
@Component({
  selector: 'app-add-customers',
  imports: [PageHeader, NgSelectComponent, DatePicker, Dialog, AutoComplete, NgClass, NgStyle,
    IntlTelInput,
    ReactiveFormsModule, FormError, OnlyStringDirective, onlyNumberDirective],
  templateUrl: './add-customers.html',
  styleUrl: './add-customers.scss',
})
export class AddCustomers {
// !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _destroyRef = inject(DestroyRef);
  _customerService = inject(Customers);
  _messageServices=inject(MessageService)
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('phoneInput') phoneInput: any;
  date2: Date | undefined;
  buttonConfig=BUTTON_CONFIG;
//  actions = [
//   { label: this.ButtonLabel, type: this.ButtonClass, action: 'save' },
//   { label: 'جديد', action: 'reset' },
//   { label: 'حذف', action: 'delete' },
//   { label: 'طباعه', action: 'print' }
// ];

actions: any[] = [];


explorerBtn={
  label:'مستكشف العملاء  ',
  link:'/customers/explorer'
}

dataChecked='company'


  loadUtils = () => import("intl-tel-input/utils");

items=[]


   visible: boolean = false;

    showDialog() {
        this.visible = true;
    }

  customerForm = this._fb.group({

  isCustAndSupp: [true, Validators.required],

  customerType: [2, Validators.required],

  customerCode:[''], // لسه الباك مش ضايفة

  nameAr: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(100),

  ]],

  nameEn: ['', [
    Validators.required,
    Validators.minLength(3),
    Validators.maxLength(100),
  ]],

  phoneNumber: ['', [
    Validators.required,
    egyptSaudiPhoneValidator
  ]],

  phoneCountryCode: ['+966', [
    Validators.required,
  ]],

  email: ['', [
    Validators.required,
    EmailValidation
  ]],

  creditWarningLimit: [null, [
    // Validators.min(0),
    Validators.required
  ]],

  creditLimit: [null, [
    // Validators.min(0),
    Validators.required
  ]],

  idTypeId: [null, Validators.required],

  idNumber: ['', [
    Validators.required,
    Validators.minLength(14),
Validators.maxLength(14)
  ]],

  taxNumber: ['',[Validators.required,
    Validators.minLength(15),
Validators.maxLength(15)
  ]],

  notes: ['',[Validators.minLength(3),
Validators.maxLength(200)]],

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


commercialRegister=[
  {
    id:1,
    name:'رقم السجل التجارى'
  },
  {
    id:2,
    name:'رخصة وزارة الشؤون البلدية والقروية والإسكان'
  },
  {
    id:3,
    name:'رخصة وزارة الموارد البشرية والتنمية الاجتماعية'
  },
  {
    id:4,
    name:'رخصة وزارة الاستثمار'
  },
  {
    id:5,
    name:'معرف آخر'
  }
]






showSearchBox: boolean = false;
selectedSearch='اسم العميل'

idResultSearch: number = 0;
pageIndex = 1;
pageSize = 10;
idUpdate: number = 0;
isEditMode: boolean = false;

token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImJlNzA2NTc4LTg1ODUtNDZjNi1iOGI3LTljOTUyYzZiYjY1ZiIsImVtcGxveWVlSWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3VwZXJBZG1pbiIsImV4cCI6MTc4NjUxOTM0MCwiaXNzIjoiaHR0cHM6Ly9tYWplZHNvZnRjb21wYW55LTAwMS1zaXRlNDIuc3RlbXB1cmwuY29tLyIsImF1ZCI6Imh0dHBzOi8vbWFqZWRzb2Z0Y29tcGFueS0wMDEtc2l0ZTQyLnN0ZW1wdXJsLmNvbSJ9.Nm7cNzg9msbQjCoo4xU-CUB-NgOZkx_q6b1HZR8Cu0Y"
// !!!!!!!!!!!!!!! Methods

// updateSimpleAddressValidation(type: number) {
//   const simple = this.customerForm.get('simpleAddress');
//   const address = this.customerForm.get('address');

//   if (type === 1) {
//     // 👤 فرد
//     simple?.enable({ emitEvent: false });
//     simple?.setValidators([
//       Validators.required,
//       Validators.minLength(3),
//       Validators.maxLength(200)
//     ]);
//     simple?.updateValueAndValidity({ emitEvent: false });

//     address?.reset();
//     address?.disable({ emitEvent: false });

//   } else {
//     // 🏢 شركة
//     simple?.reset();
//     simple?.clearValidators();
//     simple?.disable({ emitEvent: false });
//     simple?.updateValueAndValidity({ emitEvent: false });

//     address?.enable({ emitEvent: false });

//     Object.keys((address as any).controls).forEach((key) => {
//       const control = address?.get(key);
//       control?.setValidators([Validators.required]);
//       control?.updateValueAndValidity({ emitEvent: false });
//     });

//     // 👇 مهم جدًا جدًا
//     address?.updateValueAndValidity({ emitEvent: false });
//   }
// }

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
      Validators.maxLength(200)
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
  Object.keys(addressGroup.controls).forEach(key => {
    const control = addressGroup.get(key);
    control?.setValidators([Validators.required]);
    control?.updateValueAndValidity({ emitEvent: false });
  });

  addressGroup.updateValueAndValidity({ emitEvent: false });
  }
}
ngOnInit(): void {
  this.customerForm.get('nameAr')?.valueChanges
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe((value) => {

    this.customerForm.get('nameEn')?.setValue(value, {
  emitEvent: false
});
    });

      this.customerForm.get('customerType')?.valueChanges
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe((type: any) => {
      this.updateSimpleAddressValidation(type);
    });
  this.refreshActions();
  }
  
@HostListener('document:click', ['$event'])

onClick(event: any) {
  const targetElement = event.target.closest('.search_input') as HTMLElement;
  if(!targetElement){
    this.showSearchBox = false
  }

}

    search(event: AutoCompleteCompleteEvent) {
          const query = (event.query ?? '').trim();
        
          if (!query) {
            this.items = [];
            this.idResultSearch = 0;
            return;
          }
        
        
          console.log("id Result Search",this.idResultSearch);
        
          const EnumSearch = SearchableColumnEnum.NameEn;
          const payload = buildSearchPayload(query, this.pageSize, EnumSearch);
        
          this._customerService.search(payload)
            .pipe(takeUntilDestroyed(this._destroyRef))
            .subscribe({
              next: (res: any) => {
                this.items = res.data.rows.map((item: any) => ({
                  label: item.name,
                  value: item.id
                }));
              }
            });
    }

    

    selectFilterSearch(type:'mobile' | 'name' | 'tax' | 'commercial'){
  if(type == 'name'){
    this.selectedSearch='اسم العميل'
    this.showSearchBox = false

  }else if(type == 'mobile'){
    this.selectedSearch='رقم الجوال'
    this.showSearchBox = false

  }else if(type == 'tax'){
    this.selectedSearch='الرقم الضريبي'
    this.showSearchBox = false

  }else if(type == 'commercial'){
    this.selectedSearch='السجل التجاري'
    this.showSearchBox = false
  }

}


changeChecked(event: any) {
  const checked = event.target.checked;
  const label = event.target.getAttribute('data-label');
  this.dataChecked= label

}

// onPhoneChange() {
//   const iti = this.phoneInput?.iti;
//   if (!iti) return;

//   const number = iti.getNumber(); // الرقم كامل

//   this.customerForm.patchValue({
//     phoneNumber: number
//   });
// }
onPhoneChange(event: any) {
  const number = event?.target?.value;
  if (!number) return;

  this.customerForm.get('phoneNumber')?.setValue(number, {
    emitEvent: false
  });
}

onCountryChange() {
  const iti = this.phoneInput?.iti;

  if (!iti) return;

  const country = iti.getSelectedCountryData();

  const dialCode = country?.dialCode;

  this.customerForm.patchValue({
    phoneCountryCode: dialCode ? '+' + dialCode : ''
  });
}
handleAction(action: string) {
  switch (action) {
    case 'save':
      this.save();
      break;
    case 'reset':
      this.reset();
      break;
    case 'delete':
      this.delete();
      break;
    case 'print':
      this.print();
      break;
  }
}



save(){

  if (this.customerForm.invalid) {
     Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      if (control && control.invalid) {
        console.log(key, control.errors);
      }
    });
    this.customerForm.markAllAsTouched();
    return;
  }

  // const { isCustAndSupp,customerCode,...payload}= this.cust
  // omerForm.getRawValue(); // 👈 أهم سطر

   const raw = this.customerForm.getRawValue();

  let payload: any;

  if (raw.customerType === 1) {
   
    payload = {
      ...raw,
      address: null
    };
  } else {
    payload = {
      ...raw,
      simpleAddress: null
    };
  }

if(this.idUpdate == 0){
  
  this._customerService.create(payload,{
    'Authorization': `Bearer ${this.token}`
  })
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res) => {
        this._messageServices.add({
          severity: 'success',
          summary: 'Success',
          detail: 'تم الحفظ بنجاح'
        });

        // this.customerForm.reset({
        //   isCustAndSupp: true,
        //   customerType: 2,
        //   phoneCountryCode: '+966'
        // });

        // this.updateSimpleAddressValidation(2);
        this.updateSimpleAddressValidation(this.customerForm.get('customerType')?.value);
        this.idUpdate=res.data;
        this.refreshActions(); 
        
      }
    });
}else{
  // Update


  this._customerService.update(payload,this.idUpdate,{
    'Authorization': `Bearer ${this.token}`
  }).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next: (res) => {
      this._messageServices.add({
        severity: 'success',
        summary: 'Success',
        detail: 'تم التحديث بنجاح'
      });
      // this.customerForm.reset({
      //   isCustAndSupp: true,
      //   customerType: 2,
      //   phoneCountryCode: '+966'
      // });
      // this.updateSimpleAddressValidation(2);
      this.updateSimpleAddressValidation(this.customerForm.get('customerType')?.value);
      // this.idUpdate=0;
      this.refreshActions(); 
    }
  })

}

    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImJlNzA2NTc4LTg1ODUtNDZjNi1iOGI3LTljOTUyYzZiYjY1ZiIsImVtcGxveWVlSWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3VwZXJBZG1pbiIsImV4cCI6MTc4NjUxODkwOCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzIwMi8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MjAyIn0.l1L7OWjCq6piIqtvxFhNTbVgtcAJ9FHI_TnWqoQluBA
  
}

reset(){
  this.refreshActions();
   this.customerForm.reset({
        isCustAndSupp: true,
        customerType: 2,
        phoneCountryCode: '+966'
      });
      this.idUpdate=0;
}


delete(){
  console.log('Delete action triggered');
}

print(){
  console.log('Print action triggered');
}



  get ButtonLabel(){
    return this.idUpdate > 0 ? this.buttonConfig.edit.label : this.buttonConfig.create.label
  }


  get ButtonClass(){
    return this.idUpdate > 0 ? this.buttonConfig.edit.class : this.buttonConfig.create.class
  }

// <div class=" select2-bootstrap-prepend">
//       <select id="CutsIdentificationschemeID" class="form-control select2">
//           <option value="CRN">رقم السجل التجارى</option>
//           <option value="MOM">رخصة وزارة الشؤون البلدية والقروية والإسكان</option>
//           <option value="MLS">رخصة وزارة الموارد البشرية والتنمية الاجتماعية</option>
//           <option value="SAG">رخصة وزارة الاستثمار</option>
//           <option value="OTH">معرف آخر</option>
//       </select>


  refreshActions() {
  this.actions = [
    { label: this.ButtonLabel, type: this.ButtonClass, action: 'save' },
    { label: 'جديد', action: 'reset' }
  ];

  if (this.idUpdate > 0) {
    this.actions.push(
      { label: 'حذف', action: 'delete' },
      { label: 'طباعه', action: 'print' }
    );
  }
}


}
