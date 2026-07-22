import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AutoCompleteCompleteEvent, AutoComplete } from 'primeng/autocomplete';
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { CustodyService } from './services/custody-service';
import { MessageService } from 'primeng/api';
import { NgClass } from '@angular/common';
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { Paginator } from "primeng/paginator";
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";

@Component({
  selector: 'app-custody',
  imports: [AutoComplete, NgClass, FormError, ReactiveFormsModule, Paginator, SharedConfirmDialog,FormsModule],
  templateUrl: './custody.html',
  styleUrl: './custody.scss',
})
export class Custody {
 

// !!!!!!!!!!!!!!!!!!! Services
_fb:FormBuilder=inject(FormBuilder);
_custodyService=inject(CustodyService)
// _toastr:ToastrServices=inject(ToastrServices);
_messageServices:MessageService=inject(MessageService)
private _destroyRef = inject(DestroyRef);


// !!!!!!!!!!!!!!!!!! Properties
@ViewChild('autoComplete') autoComplete!: AutoComplete;

custodyForm=this._fb.group({
  nameAr: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
  nameEn: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
})

  

items: any[] = [];
value: any;
selectedSearch:string='بحث'

sectionsList:any | null=null;
isEditMode:boolean=false
buttonConfig=BUTTON_CONFIG;
unitId:number=0
searchValue:string='';
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

// !!!!!!!!!!!!!!! Methods

ngOnInit(): void {
  this.custodyForm.get('nameAr')?.valueChanges.subscribe((value: any) => {
    this.custodyForm.patchValue({
      nameEn: value
    })
  })
  this.getAll();
}


search(event: AutoCompleteCompleteEvent) {
  const searchEnum=SearchableColumnEnum.Name
  const payload = buildSearchPayload(event.query,this.pageSize);

  this._custodyService.search(payload)
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


onSelect(event: any) {

    if (!event?.value?.value) {
    console.log('No value selected');
    this.idResultSearch = 0;
    this.getAll();
    return;
  }
    this.idResultSearch = event.value?.value ?? 0;

  
  if(this.idResultSearch==0){

    this._messageServices.add({
      severity: 'error',
      summary: 'خطأ في البيانات',
      detail: 'الرجاء اختيار قيمة',
    });
    return;
  }
  this._custodyService.getById(this.idResultSearch).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{

    this.sectionsList = {
   isSuccess: true,
   data: {
     rows: [res.data],
    paginationInfo: res.data.paginationInfo
  }
};

this.searchValue = '';
      this.totalRecords = 1 ;
    }
  })
}

  clearSearch() {
  this.idResultSearch = 0;
  this.items = [];
  this.getAll();
}

onSubmit(){
  if(this.custodyForm.invalid){
    this.custodyForm.markAllAsTouched();
    return;
  }
 if(this.isEditMode == false){
  
  this._custodyService.create(this.custodyForm.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
    ...this.custodyForm.value,
  }

  this._custodyService.updateWithOutPathParameter(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
  this._custodyService.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this.sectionsList=res;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
    }
  })
}


showPopupDelete(id:number){
  this.showDeleteDialog=true;
  this.unitId=id
}

deleteSections(){
  this._custodyService.delete(this.unitId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
  this._custodyService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      console.log(res);
      this.custodyForm.patchValue({
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
  this.custodyForm.reset();
  this.unitId=0
  this.idResultSearch=0
}

onPageChange(event:any){
   this.pageIndex = event.first ?? 0;
   this.pageSize = event.rows ?? 10;
   this.getAll();
}
}
