import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { APP_CONSTANTS } from '../../../../../../shared/constants/app.constants';
import * as CryptoJS from 'crypto-js';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LookupFacade } from '../../../../../../shared/base/LookupFacade';
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransferRequestService } from '../services/transfer-request-service';
import { TransferRequestById } from '../models/transfer-request';
import { NgClass } from '@angular/common';
import { MessageService } from 'primeng/api';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
// import AES from 'crypto-js/aes';
// import Utf8 from 'crypto-js/enc-utf8';
@Component({
  selector: 'app-add-inventory-transfer-order',
  imports: [PageHeader, DatePicker, NgSelectComponent, ReactiveFormsModule, FormError, AutoCompleteModule, NgClass, SharedConfirmDialog],
  templateUrl: './add-inventory-transfer-order.html',
  styleUrl: './add-inventory-transfer-order.scss',
})
export class AddInventoryTransferOrder  extends FormComponentBase{
  
   // !!!!!!!!!!!!!!!!! Services
   _fb:FormBuilder=inject(FormBuilder);
   _lookupFacade:LookupFacade=inject(LookupFacade)
   _transferServices:TransferRequestService=inject(TransferRequestService);
   _destroyRef:DestroyRef=inject(DestroyRef);
   _messageService:MessageService=inject(MessageService);
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  date2: Date | undefined;
  dataUnits: any[] = [];

paymentMethod=[
{
  name:'كاش',
  id:1
},
{
id:2,
name:'اجل'
},
{
  name:'شيك',
  id:3
},


]

explorerBtn={
  label:'مستكشف طلب التحويلات ',
  link:'/inventory-transfer-order/explorer'
}


settingsUser:string | number | boolean | null | undefined | any;


itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  store: `مخزن ${((i % 3) + 1)}`, // 3 مخازن
  itemName: `صنف ${i + 1}`,
  unit: ['قطعة', 'كرتونة', 'كيلو'][i % 3], // وحدات مختلفة
  qty: Math.floor(Math.random() * 100) + 1,
}));

transferOrderForm:any=this._fb.group({
  reference: [''],
  employeeName: [''],
  fromWarehouseId: [null, [Validators.required]],
  toWarehouseId: [null, [Validators.required]],
  date: [new Date(), [Validators.required]],
  notes: [''],
  lines: this._fb.array([]),
});

// !!!!!!!!!!!!!!! Methods
ngOnInit(){
  this.decrptApplicationSettings();
  this.loadMoreInventories();
  this._lookupFacade.loadUnitOfMeaguare();
  this.initAddItemForm();
  this.loadTransferRequest();
  this.refreshActions();
}

decrptApplicationSettings(){

  const encrypted =localStorage.getItem('applicationSettings') ;    
  const secret =APP_CONSTANTS.secretKey;  
  const bytes = CryptoJS.AES.decrypt(encrypted!, secret);
      
  const settings = JSON.parse(
        bytes.toString(CryptoJS.enc.Utf8)
      );

      // console.log(settings.user);
  
  this.transferOrderForm.patchValue({
    employeeName: settings.user.userName,
    // علي ماتتظبط
    // toWarehouseId: settings.user.defaultWarehouseId,
    toWarehouseId: 6
  });

  this.settingsUser = settings.user;

  console.log('settings', this.settingsUser);
    
  
}






idEdit: number | null = null;

loadTransferRequest(): void {
  const id = this._sharedStateService.selectedId$();
  if (!id) {
    return;
  }

  this._transferServices
    .getById(id)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        this.fillForm(res.data);
      },
    });
}

fillForm(data: TransferRequestById): void {
  this.transferOrderForm.patchValue({
    reference: data.reference ?? '',
    employeeName: data.employeeName ?? this.settingsUser?.userName ?? '',
    fromWarehouseId: data.fromWarehouseId ?? null,
    toWarehouseId: data.toWarehouseId ?? null,
    date: data.date ?? data.requestDate
      ? new Date(data.date ?? data.requestDate!)
      : new Date(),
    notes: data.notes ?? '',
  } as any);

  this.lines.clear();

  const details = data.lines ?? data.transferRequestLines ?? [];
  details.forEach((item) => {
    this.lines.push(
      this.createLine({
        productId: item.productId,
        productCardId: item.productCardId,
        qty: item.requestedQuantity,
        code: item.productCode ?? item.code ?? '',
        itemName: item.productName ?? item.itemName ?? '',
        unitName: item.unitName ?? '',
        unitId: item.unitId,
      }),
    );
  });

  this.changeButtonState(data.id, true);
  this.requestSearchControl.setValue(
    String(data.code ?? data.requestNo ?? ''),
    { emitEvent: false },
  );
  this._sharedStateService.setSelectedId(data.id);
  this.editingIndex = null;
  this.transferOrderForm.markAsPristine();
  this.transferOrderForm.markAsUntouched();
  this.transferOrderForm.updateValueAndValidity();
}


save(){
  // debugger;
  // console.log(this.transferOrderForm.value);
  if(this.transferOrderForm.invalid){
    this.transferOrderForm.markAllAsTouched();
    return;
  }

  if(this.lines.length === 0){
    // this.lines.markAllAsTouched();
    this._messageService.add({severity:'error', summary:'خطأ', detail:'يجب عليك اضافة صنف واحد علي الأقل'});
    return;
  }


  const dto:any = {
    reference: this.transferOrderForm.value.reference,
    fromWarehouseId: this.transferOrderForm.value.fromWarehouseId,
    toWarehouseId: this.transferOrderForm.value.toWarehouseId,
    date: this.transferOrderForm.value.date,
    notes: this.transferOrderForm.value.notes,
    lines: this.lines.controls.map(line => ({
      productId: line.get('productId')?.value,
      productCardId: line.get('productCardId')?.value,
      requestedQuantity: line.get('requestedQuantity')?.value
    }))
  };


  if(this.isEditMode == false){
    this._transferServices.create(dto).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      console.log(res);
      this._messageService.add({severity:'success', summary:'تم الحفظ', detail:'تم حفظ الطلب بنجاح'});
      this.changeButtonState(res.data.id, true);
    });   
  }else{
    dto.id = this.idUpdate as number;
    this._transferServices.updateTransferRequest(dto,this.idUpdate as number).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      console.log(res);
      this._messageService.add({severity:'success', summary:'تم التعديل', detail:'تم تعديل الطلب بنجاح'});
    });
  }

 
  console.log(this.transferOrderForm.value);


  
}

reset(){
  this.transferOrderForm.reset({
    employeeName: this.settingsUser?.userName,
    // toWarehouseId: this.settingsUser?.defaultWarehouseId,
    toWarehouseId: 6,
    date: new Date(),
  });
  this.lines.clear();
  this.addItemForm.reset();
  this.requestSearchControl.reset();
  this.editingIndex = null;
  this._sharedStateService.clearSelectedId();
  this.changeButtonState(0, false);
}

showDeleteDialogTransfer = false;
deleteDialogTransfer(){
  console.log('Delete action triggered');
  this._transferServices.delete(this.idUpdate as number).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
    console.log(res);
    this._messageService.add({severity:'success', summary:'تم الحذف', detail:'تم حذف الطلب بنجاح'});
    this.showDeleteDialogTransfer = false;
    this.reset();
  });
}



delete(){
 this.showDeleteDialogTransfer = true;
}

print(){
  console.log('Print action triggered');
}




// !!!! Form Array

addItemForm!: FormGroup;

initAddItemForm() {
  this.addItemForm = this._fb.group({
    code: ['', Validators.required],
    itemName: [''],
    unitName: ['', Validators.required],
    unitId: [null, Validators.required],
    qty: [1, [Validators.required]],
    productId: [null],
    productCardId: [null],
  });
}
get lines(): FormArray {
  return this.transferOrderForm.get('lines') as FormArray;
}


createLine(value: any): FormGroup {
  return this._fb.group({
    // productId: [productId], // يمكنك ربطه بـ ID الصنف الحقيقي لاحقاً
    // productCardId: [productCardId],
    // requestedQuantity: [qty, [Validators.required]],

    // // UI Only
    // code: [code,[Validators.required]],
    // itemName: [itemName,[Validators.required]],
    // unitName: [unitName],
    // unitId: [null,[Validators.required]],

    productId: [value.productId],
    productCardId: [value.productCardId],
    requestedQuantity: [value.qty, Validators.required],

    code: [value.code],
    itemName: [value.itemName],
    unitName: [value.unitName],
    unitId: [value.unitId]
  });
}


addNewLine() {
  const value = this.addItemForm.value;
  if (this.addItemForm.invalid) {
    this.addItemForm.markAllAsTouched(); // إظهار الأخطاء إذا حاول الضغط وهو فارغ
    return;
  }

  // console.log(value);



  
  // إنشاء السطر الجديد وضخه في الـ FormArray
 if(this.editingIndex === null){
  const newLine = this.createLine(this.addItemForm.value);
  newLine.get('unitId')?.setValue(value.unitId);
  
  this.lines.push(newLine);

  // إعادة تعيين حقول الإضافة فقط
  this.addItemForm.reset({
    code: '',
    itemName: '',
    unitId: null,
  
    qty: 1
  });
  this.dataUnits = [];
  this.editingIndex = null;
 }else{
  this.updateLine(this.editingIndex);
 }
}

removeLine(index: number) {
  this.lines.removeAt(index);
}

getTotalQuantity(): number {
  return this.lines.controls.reduce((total, control) => {
    const qty = Number(control.get('requestedQuantity')?.value) || 0;
    return total + qty;
  }, 0);
}

// !!! Search
items: any[] = [];
searchControl = new FormControl('');
requestSearchControl = new FormControl('');

searchTransferRequest(event?: Event): void {
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

  this._transferServices
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
        const row = res.data?.rows?.[0];

        if (!row?.id) {
          this._messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'لم يتم العثور على طلب بهذا الرقم',
          });
          return;
        }

        this._transferServices
          .getById(row.id)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe({
            next: (detailsRes: any) => {
              this.fillForm(detailsRes.data);
              this.requestSearchControl.reset();
            },
          });
      },
    });
}

search(event: AutoCompleteCompleteEvent) {
  const query = (event.query ?? '').trim();
  if (!query) {
    this.items = [];
    return;
  }



  console.log(query);

  // const pageIndex = 0;
  // const PageSize = 0;

  this._transferServices
    .searchByName(query)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe((res: any) => {
      // this.items = res.data.rows.map((item: any) => ({
      //   label: item.name,
      //   value: item.id,
      // }));

      this.items = res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      }));
      console.log(res);
  
      setTimeout(() => {
        this.autoComplete.show();
      });
    });
}

// onSelectProduct(event: any) {
//   this.addItemForm.get('itemName')?.setValue(event.item.name);
// }


onSelectProduct(event: any) {

  console.log(event);
  const productId = typeof event.value === 'object' ? event.value?.value : event.value;

  if (!productId) {
    return;
  }


  this._transferServices.lookupById(productId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
    console.log(res);
    const data = res.data;
    this.addItemForm.patchValue({
      itemName: data.productName,
      code: data.productCode,
      unitId: data.unitId,
    });
    this.dataUnits = data.units.map((unit: any) => ({
      productId: data.productId,
       ...unit,
     })) ;
  });
  // this._purchaseServices
  //   .getProductCartByProductId(productId)
  //   .pipe(takeUntilDestroyed(this._destroyRef))
  //   .subscribe((res: ApiResponse<ProductUnitItem[]>) => {
  //     this.unitData = res.data;

  //     if (this.unitData.length > 0) {
  //       const firstUnit = this.unitData[0];

  //       this.itemAddingForm.patchValue(
  //         {
  //           productCartId: firstUnit.id,
  //           productCode: firstUnit.productCode || '',
  //           productName: typeof event.value === 'object' ? event.value.label : firstUnit.productName || '',
  //           unitId: firstUnit.id,
  //           unitName: firstUnit.fromUnitName || firstUnit.name || '',
  //           price: firstUnit.purchasePrice ?? firstUnit.price ?? 0,
  //           qty: 1,
  //           discountRate: 0,
  //           discountAmount: 0,
  //         },
  //         { emitEvent: false },
  //       );

  //       this.calculateAddingRowTotals();
  //     }
  //   });
}

onSearchByCode(event: any) {
  // console.log(event);
  const code = event.target.value;
    // console.log(code);



    this._transferServices.searchByCode(code).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      console.log(res);
      const data = res.data;
      this.addItemForm.patchValue({
        itemName: data.productName,
        code: data.productCode,
        unitId: data.unitId,
      });
      this.dataUnits = data.units.map((unit: any) => ({
       productId: data.productId,
        ...unit,
      })) ;
      // if(res.data.rows.length > 0){
    });
}


onUnitChange(unitId: any) {
  
  const unit = this.dataUnits.find(x => x.unitId === unitId.unitId);

 
  console.log(unit);
  if (!unit) return;

  this.addItemForm.patchValue({
    unitName: unit.unitName,
    productId: unit.productId,
    productCardId: unit.productCardId,
  });

  console.log('addItemForm',this.addItemForm.value);

}

editingIndex: number | null = null;

editLine(index: number) {
  this.editingIndex = index;

  const line = this.lines.at(index);

  console.log(line);

  this.addItemForm.patchValue({
    code: line.get('code')?.value,
    itemName: line.get('itemName')?.value,
    unitId: line.get('unitId')?.value,
    unitName: line.get('unitName')?.value,
    qty: line.get('requestedQuantity')?.value,
  });
}

updateLine(index: number) {

  if (this.addItemForm.invalid) {
    this.addItemForm.markAllAsTouched();
    return;
  }

  const value = this.addItemForm.value;

  const line = this.lines.at(index);

  line.patchValue({
    code: value.code,
    itemName: value.itemName,
    unitId: value.unitId,
    unitName: value.unitName,
    requestedQuantity: value.qty
  });

  this.editingIndex = null;

  this.addItemForm.reset({
    code: '',
    itemName: '',
    unitId: null,
    unitName: '',
    qty: 1
  });
}

// updateLine(index: number) {
//   console.log(index);
// }
// !!! Scroll Inventory
page = 0;
pageSize = 10;
loading = false;
hasMore = true;

loadMoreInventories() {

  if (this.loading || !this.hasMore) {
    return;
  }

  this.loading = true;

  const nextPage = this.page + 1;

  this._lookupFacade
    .loadInventoriesWithPagination(nextPage, this.pageSize)
    .subscribe({
      next: (res: any) => {

        if (!res.data.rows.length) {
          this.hasMore = false;   // وقف أي Scroll بعد كده
          return;
        }

        this.page = nextPage;      // حدث الصفحة فقط لو فيه بيانات
      },
      complete: () => {
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });

}

ngOnDestroy(){
this._sharedStateService.clearSelectedId();

}
}
