import { Component, DestroyRef, inject } from '@angular/core';
import { InventoriesServices } from './services/inventories-services';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AutoComplete, AutoCompleteCompleteEvent } from "primeng/autocomplete";
import { InventoriesType } from './models/inventories';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { SharedConfirmDialog } from "../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { NgClass } from '@angular/common';
import { buildSearchPayload } from '../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../shared/Enums/enumSearch';
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-inventories',
  imports: [ReactiveFormsModule, AutoComplete, FormError, SharedConfirmDialog, NgClass, Paginator],
  templateUrl: './inventories.html',
  styleUrl: './inventories.scss',
})
export class Inventories {
// !!!!!!!!!!!!! Services
_inventoriesServices: InventoriesServices=inject(InventoriesServices);
_fb:FormBuilder=inject(FormBuilder);
_destroyRef:DestroyRef=inject(DestroyRef);
_messageServices:MessageService=inject(MessageService)
// !!!!!!!!!!!! properites
inventoriesForm=this._fb.group({
  nameAr: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  nameEn: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
})
items: any[] = [];
selectedSearch:string='بحث'
inventoriesList:InventoriesType | null=null
totalRecords = 0
isEditMode:boolean=false
idResultSearch: number =0
idInventory:number=0
pageIndex=1;
pageSize=10
showDeleteDialog=false
buttonConfig=BUTTON_CONFIG;
token='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImJlNzA2NTc4LTg1ODUtNDZjNi1iOGI3LTljOTUyYzZiYjY1ZiIsImVtcGxveWVlSWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3VwZXJBZG1pbiIsImV4cCI6MTc3NzQ0OTI5OCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzIwMi8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MjAyIn0.MpWq4_oaIMQ5IP9ydpD_0Tsqc35CtLWYryj_vScX5kg'

// !!!!!!!!!! Methods

ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  this.inventoriesForm.get('nameAr')?.valueChanges.subscribe((value) => {
    this.inventoriesForm.patchValue(
      { nameEn: value },
      { emitEvent: false } 
    );
  });
  this.getAllData();
}

// search(event: AutoCompleteCompleteEvent) {
 
//   const query = (event.query ?? '').trim();

//   console.log('query:', query);

//   if (!query) {
//     this.items = [];
//     this.idResultSearch = 0;
//     this.getAllData();
//     return;
//   }

//       const EnumSearch=SearchableColumnEnum.NameEn
//       const payload = buildSearchPayload(event.query,this.pageSize,EnumSearch);
    
//       this._inventoriesServices.search(payload)
//         .pipe(takeUntilDestroyed(this._destroyRef))
//         .subscribe({
//           next: (res: any) => {
//             this.items = res.data.rows.map((item: any) => ({
//               label: item.name,
//               value: item.id
//             }));
    
//           }
//         });
//   }

search(event: AutoCompleteCompleteEvent) {

  const query = (event.query ?? '').trim();

  if (!query) {
    this.items = [];
    this.idResultSearch = 0;
    this.getAllData();
    return;
  }


  console.log("id Result Search",this.idResultSearch);

  const EnumSearch = SearchableColumnEnum.NameEn;
  const payload = buildSearchPayload(query, this.pageSize, EnumSearch);

  this._inventoriesServices.search(payload)
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
if (!event || !event.value) {
  this.idResultSearch = 0;
  this.getAllData();
  return;
}

  this.idResultSearch = event.value.value;

   if (this.idResultSearch == 0) {
      // this.getAll();
      this._messageServices.add({
        severity: 'error',
        summary: 'خطاء في البيانات',
        detail: 'الرجاء اختيار قيمة',
      });
      return;
    }

    console.log("id Result Search",this.idResultSearch);

  this._inventoriesServices.getById(this.idResultSearch)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe({
      next: (res: any) => {
        this.inventoriesList = {
          isSuccess: true,
          data: {
            rows: [res.data],
            paginationInfo: {
              totalRowsCount: 1,
              totalPagesCount: 1
            }
          }
        };

        this.totalRecords = 1;
      }
    });
  }

  clearSearch() {
  this.idResultSearch = 0;
  this.items = [];
  this.getAllData();
}
  // searchUnit() {
  //   if (this.idResultSearch == 0) {
  //     // this.getAll();
  //     this._messageServices.add({
  //       severity: 'error',
  //       summary: 'خطاء في البيانات',
  //       detail: 'الرجاء اختيار قيمة',
  //     });
  //     return;
  //   }

  //   console.log("id Result Search",this.idResultSearch);

  // this._inventoriesServices.getById(this.idResultSearch)
  //   .pipe(takeUntilDestroyed(this._destroyRef))
  //   .subscribe({
  //     next: (res: any) => {
  //       this.inventoriesList = {
  //         isSuccess: true,
  //         data: {
  //           rows: [res.data],
  //           paginationInfo: {
  //             totalRowsCount: 1,
  //             totalPagesCount: 1
  //           }
  //         }
  //       };

  //       this.totalRecords = 1;
  //     }
  //   });
  // }

  getAllData(){
    const pageNumber=Math.floor(this.pageIndex/this.pageSize) + 1
    this._inventoriesServices.getAllSendInQuery(pageNumber,this.pageSize).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this.inventoriesList=res;
        this.totalRecords = res.data.paginationInfo.totalRowsCount;
      }
    })
  }
onSubmit(){
  if(this.inventoriesForm.invalid){
    this.inventoriesForm.markAllAsTouched();
    return;
  }
  if(this.isEditMode == false){
  
  this._inventoriesServices.create(this.inventoriesForm.value,{
      "Authorization":`Bearer ${this.token}`
  }).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res :any)=>{
      // this._toastr.show('تم الاضافة بنجاح','success');
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الاضافة بنجاح',
      })
      this.isEditMode=true;
      this.getAllData();
    },
    
  })
  }else{
    // update
    const payload={
      id:this.idInventory,
      ...this.inventoriesForm.value,
    }
    this._inventoriesServices.update(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم التعديل بنجاح',
        })
        this.isEditMode=true;
        this.getAllData();
      }
    })
  }
}


editData(id:number){
  this.isEditMode=true;
  this.idInventory=id;
  this._inventoriesServices.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this.inventoriesForm.patchValue({
        nameAr:res.data.name,
        nameEn:res.data.name
      })
    }
  })

}


showPopupDelete(id:number){
  this.showDeleteDialog=true;
  this.idInventory=id  

}


deleteInventories(){
  this._inventoriesServices.delete(this.idInventory).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.showDeleteDialog=false;
      this.resetForm();
      this.getAllData();
      
    }
  })
}

get buttonLabel(): string {
  return this.isEditMode ? this.buttonConfig.edit.label : this.buttonConfig.create.label;
}

get buttonClass(): string {
  return this.isEditMode ? this.buttonConfig.edit.class : this.buttonConfig.create.class;
}

resetForm(){
  this.isEditMode=false;
  this.inventoriesForm.reset();
  this.idResultSearch=0
  this.idInventory=0

}

onPageChange(event:any){
   this.pageIndex = event.first ?? 0;
   this.pageSize = event.rows ?? 10;
   this.getAllData();
}
}


// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6ImJlNzA2NTc4LTg1ODUtNDZjNi1iOGI3LTljOTUyYzZiYjY1ZiIsImVtcGxveWVlSWQiOiIxIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiU3VwZXJBZG1pbiIsImV4cCI6MTc3NzQ0OTI5OCwiaXNzIjoiaHR0cHM6Ly9sb2NhbGhvc3Q6NzIwMi8iLCJhdWQiOiJodHRwczovL2xvY2FsaG9zdDo3MjAyIn0.MpWq4_oaIMQ5IP9ydpD_0Tsqc35CtLWYryj_vScX5kg