import { ChangeDetectorRef, Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePickerModule } from 'primeng/datepicker';
import { FormArray, FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { MessageService } from 'primeng/api';
import { Suppliers } from '../../../customers-and-supplier/suppliers/services/suppliers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupplierModel } from '../../../customers-and-supplier/suppliers/models/supplier';
import { ProductCardService } from '../../../products/product-card/services/product-card';
import { productModel } from '../../../products/product-card/models/product-card';

import { LookupFacade } from '../../../../../../shared/base/LookupFacade';
import IntlTelInput from '@intl-tel-input/angular';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { onlyNumberDirective } from "../../../../../../shared/directives/only-number";
import { PurchaseOrderService } from '../services/purchase-order-service';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { Totals } from '../../../../../../shared/services/calculations/totals';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
// import { Suppliers } from '../../../customers-and-supplier/suppliers/suppliers';

@Component({
  selector: 'app-add-purchase-order',
  standalone: true,
  imports: [CommonModule, PageHeader, DatePickerModule, FormsModule, NgSelectModule, ReactiveFormsModule, FormError, IntlTelInput, onlyNumberDirective,
    NgClass, SharedConfirmDialog,AutoCompleteModule],
  templateUrl: './add-purchase-order.html',
  styleUrl: './add-purchase-order.scss',
})
export class AddPurchaseOrder  extends FormComponentBase{
   // !!!!!!!!!!!!!!!!! Services
   @ViewChild('autoComplete') autoComplete!: AutoComplete;
    _fb:FormBuilder=inject(FormBuilder);
    _messageService:MessageService=inject(MessageService);
    _destroyRef = inject(DestroyRef);
   _lookup = inject(LookupFacade);
   _supplierService = inject(Suppliers);
   _purchaseOrderService = inject(PurchaseOrderService);
   _totalServices = inject(Totals);
  _sharedStateServices:SharedStateServices=inject(SharedStateServices);
  // !!!!!!!!!!!!!!!!!!! Properties
  suppliersData: any[] = [];
  productData:any[]=[]
  loadUtils = () => import('intl-tel-input/utils');
  @ViewChild('phoneInput') phoneInput: any;
  purchaseOrderForm = this._fb.group({
    invoiceNumber:[0],
    supplierBalance:[''],
      reference: [
    '',
    [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ]
  ],

  invoiceDate: this._fb.control<Date | null>(
    null,
    Validators.required
  ),

  notes: [
    '',
    [
      Validators.maxLength(500)
    ]
  ],

  branchId: [
    null,
  ],

  supplierId: [
    null,
    [
      Validators.required,
    ]
  ],

  supplierName: [
    '',
    [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(150)
    ]
  ],

  supplierPhone: [
    '',
    [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(20),
     egyptSaudiPhoneValidator 
    ]
  ],

  taxNumber: [
    '',
    [
      Validators.required,
      Validators.minLength(9),
      Validators.maxLength(15)
    ]
  ],

  commercialRegister: [
    '',
    [
      Validators.required,
      Validators.minLength(7),
      Validators.maxLength(15)
    ]
  ],

  details: this._fb.array([])
  });


  detailForm = this._fb.group({
  productCardId: [null, Validators.required],
  unitId: [null, Validators.required],
  quantity: [null, Validators.required]
});
  date2: Date | undefined;
 

explorerBtn={
  label:'مستكشف طلب الشراء',
  link:'/purchase-order/explorer'
}




editIndex: number | null = null;
showDeleteDialog = false;
getTotal=null



  showSearchBox: boolean = false;
  selectedSearch = 'رقم الفاتورة';

  idResultSearch: number = 0;
  pageIndex = 1;
  pageSize = 10;
  selectedSearchType:'code' | 'name' | 'mobile' = 'code';
   searchControl = new FormControl('',Validators.required);
  cdr = inject(ChangeDetectorRef);
 
  items: any[] = [];
// !!!!!!!!!!!!!!! Methods

ngOnInit(): void {
  this.loadLookups();
  this.listenSupplierChange();
  this.loadPurchaseOrder();
  this.refreshActions();
}

loadPurchaseOrder(){
  const id=this._sharedStateServices.selectedId$();
  if(id){
    this._purchaseOrderService.getByIdInQuery(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      console.log(res);
      this.purchaseOrderForm.patchValue({
        invoiceNumber:res.data.id,
        supplierBalance:res.data.supplierBalance,
        reference:res.data.reference,
        invoiceDate: new Date(res.data.invoiceDate),
        notes:res.data.notes,
        branchId:res.data.branchId,
        supplierId:res.data.supplierId,
        supplierName:res.data.supplierName,
        supplierPhone:res.data.supplierPhone,
        taxNumber:res.data.taxNumber,
        commercialRegister:res.data.commercialRegister,
      })

      this.details.clear();

res.data.details.forEach((item: any) => {
  this.details.push(
    this._fb.group({
      productCardId: [item.productCardId],
      unitId: [item.unitId],
      quantity: [item.quantity]
    })
  );
  this.changeButtonState(res.data.id, true);
});

this.calculateTotalQuantity();
      this.purchaseOrderForm.markAsPristine();
      this.purchaseOrderForm.markAsUntouched();
      this.purchaseOrderForm.updateValueAndValidity();
    })
  }
}

private loadLookups(): void {
  this._lookup.loadProduct();
  this._lookup.loadSuppliers();
  this._lookup.loadUnitOfMeaguare();
}

private listenSupplierChange(): void {
  this.purchaseOrderForm.get('supplierId')!
    .valueChanges
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(id => {

      if (!id) {
        this.resetSupplier();
        return;
      }

      this.loadSupplier(id);

    });
}
loadSupplier(id:any){
    if (!id) {
    return;
  }
   this._supplierService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
    const supplier = res.data;
        this.purchaseOrderForm.patchValue({
          supplierName: supplier.name,
          supplierPhone: supplier.phoneNumber,
          taxNumber: supplier.taxNumber,
          commercialRegister: supplier.idNumber, 
        });
    }
  })
}

createDetail() {
  return this._fb.group({
    productCardId: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ],

    quantity: [
      null,
      [
        Validators.required,
        Validators.min(1)
      ]
    ]
  });
}

get details(): FormArray {
  return this.purchaseOrderForm.get('details') as FormArray;
}

totalQuantity = 0;
addDetail() {
   console.log(this.detailForm.value); 
  if (this.detailForm.invalid) {
    this.detailForm.markAllAsTouched();
    return;
  }

   if (this.editIndex !== null) {

    this.details.at(this.editIndex).patchValue({
      productCardId: this.detailForm.value.productCardId,
      unitId: this.detailForm.value.unitId,
      quantity: this.detailForm.value.quantity,
    });
    this.calculateTotalQuantity();
    this.editIndex = null;

  } else {

    this.details.push(
      this._fb.group({
        productCardId: this.detailForm.value.productCardId,
        unitId: this.detailForm.value.unitId,
        quantity: this.detailForm.value.quantity,
      })
    );

  }

  this.calculateTotalQuantity();
  this.detailForm.reset();
}

calculateTotalQuantity() {
  this.totalQuantity = this.details
    .getRawValue()
    .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
}

editDetail(index: number) {
  const row = this.details.at(index);

  this.detailForm.patchValue({
    productCardId: row.get('productCardId')?.value,
    unitId: row.get('unitId')?.value,
    quantity: row.get('quantity')?.value,
  });

  this.editIndex = index;
}
removeDetail(index: number) {
  this.details.removeAt(index);
  this.calculateTotalQuantity();
}

getProductName(id: number) {
  return this._lookup.products().find(x => x.id == id)?.name;
}
 
getUnitName(id: number) {
  return this._lookup.unitOfMeasures().find((x: any) => x.id == id)?.name;
}

  onPhoneChange(event: any) {
    const number = event?.target?.value;
    if (!number) return;

    this.purchaseOrderForm.get('supplierPhone')?.setValue(number, {
      emitEvent: false,
    });
  }

  onCountryChange() {
    const iti = this.phoneInput?.iti;

    if (!iti) return;

    const country = iti.getSelectedCountryData();

    const dialCode = country?.dialCode;

    // this.purchaseOrderForm.patchValue({
    //   phoneCountryCode: dialCode ? '+' + dialCode : '',
    // });
  }



  resetSupplier(){
     this.purchaseOrderForm.patchValue({
    supplierName: '',
    supplierPhone: '',
    taxNumber: '',
    commercialRegister: '',
    supplierBalance: ''
  });
  }

  // !!! Search 
       onEnter(event: any) {
  if (this.searchControl.invalid) {
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: `يجب ادخال قيمه بحث ${this.selectedSearch}`,
    })
    return;
  }
  // نفذ البحث هنا
}

  search(event:any) {

    const eventQuery = event.target.value;

    if(!eventQuery){
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: `يجب ادخال قيمه بحث برقم الفاتورة`,
      })
      return
    }
    
    this._purchaseOrderService
      .getByIdInQuery(eventQuery)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(res => {
        // this.searchResults = res.data;
        // this.showSearchBox = true;
        console.log(res);
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


  this._purchaseOrderService
    .getByIdInQuery(delegateId)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe(res => {
      // console.log(res);
      // this.idUpdate = res.data.id;
      console.log(res.data);
// asdasdasd
    
      this.purchaseOrderForm.patchValue({
        ...res.data,
        nameAr: res.data.name,
        nameEn: res.data.name,
        idTypeId: res.data.idType
      });
      // this..patchValue({
        // ...res.data
      // })
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
         this.searchControl.reset();
      this.items = [];
    });
}

// ******* search

  
 prevProduct() {
  const currentCode = Number(this.purchaseOrderForm.get('invoiceNumber')?.value);


  if (!currentCode || currentCode <= 1) {
    return;
  }

  const id = currentCode - 1;

  this.purchaseOrderForm.patchValue({
    invoiceNumber: id
  });

  // this.getProductByCode(newCode);
}

nextProduct() {
  const currentCode = Number(this.purchaseOrderForm.get('code')?.value);

  if(!currentCode){
    return;
  }
  if (isNaN(currentCode)) {
    return;
  }

  const newCode = currentCode + 1;

  this.purchaseOrderForm.patchValue({
    invoiceNumber: newCode
  });

  // this.getProductByCode(newCode);
}


getPurchaseById(id: number) {
  this._purchaseOrderService
      .getByIdInQuery(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(res => {
  
        console.log(res);
      });
};


save(){
  const lengthDetails=this.purchaseOrderForm.get('details')?.value.length;
  
  if(lengthDetails==0){
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: 'برجاء اضافة صنف واحد علي الأقل'
    })
    return;
  }

  if(this.purchaseOrderForm.invalid){
    this.purchaseOrderForm.markAllAsTouched();
    return
  }

  let payload:any={
    ...this.purchaseOrderForm.getRawValue(),
    details: this.purchaseOrderForm.get('details')?.value
  }
  if(this.isEditMode == false){
    
      this._purchaseOrderService
      .create(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({

        next: (res: any) => {

          this._messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم حفظ طلب الشراء بنجاح'
          });
          // this.reset();
          this.changeButtonState(res.data, true);
          this.purchaseOrderForm.get('invoiceNumber')?.setValue(res.data);
          this.refreshActions();

        }

      });
  }else{

    payload.id=this.idUpdate;

    this._purchaseOrderService
    .updateWithOutPathParameter(payload)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        this._messageService.add({
          severity: 'success',
          summary: 'تم',
          detail: 'تم تعديل طلب الشراء بنجاح'
        });
        
      }
    });
  }
}

reset(){
   // إعادة الفورم الرئيسية
  this.purchaseOrderForm.reset({
    invoiceNumber:0,
    supplierBalance: '',
    reference: '',
    invoiceDate: null,
    notes: '',
    branchId: null,
    supplierId: null,
    supplierName: '',
    supplierPhone: '',
    taxNumber: '',
    commercialRegister: ''
  });

  // حذف جميع الأصناف
  this.details.clear();

  // إعادة فورم إضافة الصنف
  this.detailForm.reset({
    productCardId: null,
    unitId: null,
    quantity: null
  });

  // الخروج من وضع التعديل
  this.editIndex = null;

  // رجوع الشاشة لوضع الإضافة
  this.changeButtonState(0, false);

  // إعادة أزرار الشاشة
  this.refreshActions();
  
}


delete(){
   this.showDeleteDialog=true;
   
}

deleteGroup(){
  this._purchaseOrderService.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this._messageService.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.showDeleteDialog=false;
      this.reset();
    }
  })
}

print(){
  console.log('Print action triggered');
}
}
