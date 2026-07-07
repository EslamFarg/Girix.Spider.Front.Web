import { Component, DestroyRef, inject } from '@angular/core';
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { Paginator } from "primeng/paginator";
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AllowancesService } from './services/allowances';
import { NgClass } from '@angular/common';
import { onlyNumberDirective } from '../../../../../shared/directives/only-number';

@Component({
  selector: 'app-allowances',
  imports: [SharedConfirmDialog, Paginator, FormError,ReactiveFormsModule,NgClass,AutoCompleteModule,onlyNumberDirective],
  templateUrl: './allowances.html',
  styleUrl: './allowances.scss',
})
export class Allowances {
  

// !!!!!!!!!!!!!!!!!!! Services
_fb:FormBuilder=inject(FormBuilder);
_allowancesService=inject(AllowancesService)
// _toastr:ToastrServices=inject(ToastrServices);
_messageServices:MessageService=inject(MessageService)
private _destroyRef = inject(DestroyRef);


// !!!!!!!!!!!!!!!!!! Properties

allowancesForm=this._fb.group({
  nameAr: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
  nameEn: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
  amount:['',[Validators.required]]
})

  

items: any[] = [];
value: any;
selectedSearch:string='بحث'

sectionsList:any | null=null;
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

// !!!!!!!!!!!!!!! Methods

ngOnInit(): void {
  this.allowancesForm.get('nameAr')?.valueChanges.subscribe((value) => {
    this.allowancesForm.patchValue({
      nameEn: value
    })
  })
  this.getAll();
}


search(event: AutoCompleteCompleteEvent) {
  const searchEnum=SearchableColumnEnum.Name
  const payload = buildSearchPayload(event.query,this.pageSize);

  this._allowancesService.search(payload)
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
  this._allowancesService.getById(this.idResultSearch).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{

    this.sectionsList = {
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

  clearSearch() {
  this.idResultSearch = 0;
  this.items = [];
  this.getAll();
}

onSubmit(){
  if(this.allowancesForm.invalid){
    this.allowancesForm.markAllAsTouched();
    return;
  }
 if(this.isEditMode == false){
  
  this._allowancesService.create(this.allowancesForm.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
    ...this.allowancesForm.value,
  }

  this._allowancesService.updateWithOutPathParameter(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
  this._allowancesService.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
  this._allowancesService.delete(this.unitId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
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
  this._allowancesService.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      console.log(res);
      this.allowancesForm.patchValue({
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
  this.allowancesForm.reset();
  this.unitId=0
  this.idResultSearch=0
}

onPageChange(event:any){
   this.pageIndex = event.first ?? 0;
   this.pageSize = event.rows ?? 10;
   this.getAll();
}
}
