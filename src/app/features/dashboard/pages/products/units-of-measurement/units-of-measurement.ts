import { NgClass } from '@angular/common';
import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from "primeng/autocomplete";
import { onlyNumberDirective } from '../../../../../shared/directives/only-number';
import { FormError } from '../../../../../shared/ui/form-error/form-error';
import { OnlyStringDirective } from '../../../../../shared/directives/only-string';
import {  unitOfMeasure } from './models/unit-of-meaure';
import { UnitOfMeasure } from './services/unit-of-measure';
import { ToastrServices } from '../../../../../shared/ui/toastr/services/toastr';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Paginator } from "primeng/paginator";
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-units-of-measurement',
  imports: [AutoComplete, NgClass, ReactiveFormsModule, FormError, OnlyStringDirective, Paginator, SharedConfirmDialog],
  templateUrl: './units-of-measurement.html',
  styleUrl: './units-of-measurement.scss',
})
export class UnitsOfMeasurement {
// !!!!!!!!!!!!!!!!!!! Services
_fb:FormBuilder=inject(FormBuilder);
_unitOfMeasure=inject(UnitOfMeasure);
// _toastr:ToastrServices=inject(ToastrServices);
_messageServices:MessageService=inject(MessageService)
private _destroyRef = inject(DestroyRef);

// !!!!!!!!!!!!!!!!!! Properties
@ViewChild('autoComplete') autoComplete!: AutoComplete;


unitForm=this._fb.group({
  nameAr: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  nameEn: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
})

  

items: any[] = [];
value: any;
selectedSearch:string='بحث'

unitOfMeasureList:unitOfMeasure | null=null;
isEditMode:boolean=false
buttonConfig=BUTTON_CONFIG;
unitId:number=0

pageIndex=0;
pageSize=10
totalRecords = 0;
showDeleteDialog=false

// autoComplete
loading = false;
totalPages = 0;
searchPage = 1;
searchPageSize = 10;
idResultSearch: number =0;
ignoreNextFocus = false;
// !!!!!!!!!!!!!!! Methods

ngOnInit(): void {
  this.unitForm.get('nameAr')?.valueChanges.subscribe((value) => {
    this.unitForm.patchValue({
      nameEn: value
    })
  })
  this.getAll();
}


search(event: AutoCompleteCompleteEvent) {


  
  const query = event.query?.trim();
  if (!query) {
 this.items = [];
 return;
}
  const payload = buildSearchPayload(query,this.pageSize);

  this._unitOfMeasure.search(payload)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        this.items = res.data.rows.map((item: any) => ({
          label: item.name,
          value: item.id
        }));

        setTimeout(() => {
          this.autoComplete.show();
        });

      }
    });
}


onSelect(event: any) {

    if (!event?.value?.value) {
    console.log('No value selected');
    this.idResultSearch = 0;
    this.getAll();
    return;
  }

  this.ignoreNextFocus = true;
setTimeout(() => {
  this.autoComplete.hide();
}, 0);
    this.idResultSearch = event.value?.value ?? 0;

  
  if(this.idResultSearch==0){

    this._messageServices.add({
      severity: 'error',
      summary: 'خطأ في البيانات',
      detail: 'الرجاء اختيار قيمة',
    });
    return;
  }
  this._unitOfMeasure.getById(this.idResultSearch).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{

    this.unitOfMeasureList = {
   isSuccess: true,
   data: {
     rows: [res.data],
    paginationInfo: res.data.paginationInfo
  }
};

      this.totalRecords = 1 ;
    }
  })
}



onFocusSearch(event: any) {

  if (this.ignoreNextFocus) {
    this.ignoreNextFocus = false;
    return;
  }
  const value = event.target?.value?.trim();
  console.log(value);

  const query={
    query: value
  }

  
  
  if (!value) {
    return;
    
  }
  
  // لو الاقتراحات موجودة بالفعل، متبحثش تاني
  setTimeout(() => {
  this.autoComplete.show();
  }, 100);
  if (this.items.length > 0) return;
  this.search(query as AutoCompleteCompleteEvent);
  

}



// searchUnit(){
//   if(this.idResultSearch==0){
//     // this.getAll();
//     // this._messageServices.show('الرجاء اختيار قيمة','error');
    
//     this._messageServices.add({
//       severity: 'error',
//       summary: 'خطأ في البيانات',
//       detail: 'الرجاء اختيار قيمة',
//     });
//     return;
//   }
//   this._unitOfMeasure.getById(this.idResultSearch).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
//     next:(res:any)=>{
//       // this.unitForm.patchValue({
//       //   nameAr:res.data.nameAr,
//       //   nameEn:res.data.nameEn
//       // })
//     this.unitOfMeasureList = {
//    isSuccess: true,
//    data: {
//      rows: [res.data],
//     paginationInfo: res.data.paginationInfo
//   }
// };

//       this.totalRecords = 1 ;
//     }
//   })
// }

  clearSearch() {
  this.idResultSearch = 0;
  this.items = [];
  this.getAll();
}

onSubmit(){
  if(this.unitForm.invalid){
    this.unitForm.markAllAsTouched();
    return;
  }
 if(this.isEditMode == false){
  
  this._unitOfMeasure.create(this.unitForm.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res :any)=>{
      // this._toastr.show('تم الاضافة بنجاح','success');
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الاضافة بنجاح',
      })
      this.isEditMode=true;
      this.unitId=res.data;
      this.getAll();
    }
  })


 }else{
  // update
  const payload={
    id:this.unitId,
    ...this.unitForm.value,
  }

  this._unitOfMeasure.updateWithOutPathParameter(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      // this._toastr.show('تم التعديل بنجاح','success');
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم التعديل بنجاح',
      })
      this.isEditMode=true;
      this.getAll();
    }
  })
 }

}


getAll(){
    const pageNumber = this.pageIndex / this.pageSize + 1
  this._unitOfMeasure.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this.unitOfMeasureList=res;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
    }
  })
}


showPopupDelete(id:number){
  this.showDeleteDialog=true;
  this.unitId=id
}

deleteUnitOfMeasurement(){
  this._unitOfMeasure.delete(this.unitId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      // this._toastr.show('تم الحذف بنجاح','success');
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.showDeleteDialog=false;
      this.resetForm();
      this.getAll();
    }
  })
 
}

onEditData(id:number){
  this.isEditMode=true;
  this.unitId=id;
  this._unitOfMeasure.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      console.log(res);
      this.unitForm.patchValue({
        nameAr:res.data.name,
        nameEn:res.data.name
      })
    }
  })

}

get buttonLabel(): string {
  return this.isEditMode ? this.buttonConfig.edit.label : this.buttonConfig.create.label;
}

get buttonClass(): string {
  return this.isEditMode ?  this.buttonConfig.edit.class :this.buttonConfig.create.class;
}


resetForm(){
  this.isEditMode=false;
  this.unitForm.reset();
  this.unitId=0
  this.idResultSearch=0
}

onPageChange(event:any){
   this.pageIndex = event.first ?? 0;
   this.pageSize = event.rows ?? 10;
   this.getAll();
}
}
