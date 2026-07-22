import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DelegateServices } from '../services/delegate-services';
import { DelegateModel } from '../models/delegate';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';
import { ActiveFilterKey } from '../../../../../../shared/services/active-filter-key';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';

@Component({
  selector: 'app-explorer-the-delegate',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-the-delegate.html',
  styleUrl: './explorer-the-delegate.scss',
})
export class ExplorerTheDelegate {
  // !!!!!!!!!!!! Services
  _delegateServices: DelegateServices = inject(DelegateServices);
  _messageServices:MessageService=inject(MessageService)
  _destroyRef = inject(DestroyRef);
  _sharedStateServices:SharedStateServices=inject(SharedStateServices);
  _router:Router=inject(Router);
  _activeFilterKey:any=inject(ActiveFilterKey);
  // !!!!!!!!!!!! Properties
  dataAddButton={
      label:'أضافة مندوب ',
      action:'/the-delegate/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: DelegateModel[] = [];

showDeleteDialog = false;
idDelete:number=0;

totalRecords = 0;

filteringData=[
  {label:'كود المندوب',key:'code',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'كود المندوب'},
  {label:'اسم المندوب',key:'name',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'اسم المندوب'},
  {label:'رقم الجوال',key:'phone',type:'text',value:'',class:'col-span-12 ',placeholder:'رقم الجوال'},
   ]
  EnumSearch: any;
  private cdr = inject(ChangeDetectorRef); // 2. حقن الخدمة هنا
// !!!!!!!!!!! Method
ngOnInit(): void {
  //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
  //Add 'implements OnInit' to the class.
  this.getAllData();
}

getAllData(){
  this._delegateServices.getAllSendInQuery(this.first,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.itemsTable = res.data.rows
      this.totalRecords = res.data.paginationInfo.totalRowsCount
      this.cdr.detectChanges(); // 3. تحديث الواجهة فوراً
  });
}
onPageChange(event:any){
   this.first = event.first ?? 0;
   this.rows = event.rows ?? 10;
   this.getAllData();
} 


editDelegate(id:any){
  this._sharedStateServices.setSelectedId(id);
  this._router.navigate(['the-delegate/add']);
}

 

deleteDelegate(id:any){
  this.showDeleteDialog = true
  this.idDelete = id;
}

deleteDialog(){
  if(this.idDelete > 0){
    this._delegateServices.delete(this.idDelete).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
      next:(res:any)=>{
        this._messageServices.add({
          severity: 'success',
          summary: 'نجاح',
          detail: 'تم الحذف بنجاح',
        })
        this.showDeleteDialog=false;
        this.idDelete = 0;
        this.getAllData();
        
      }
    })
  }
}


// onSearch(value:any){
//  if(value){
//   const key=this._activeFilterKey.value();
//   if(key == 'code'){
//     this.EnumSearch=SearchableColumnEnum.Code;
//   }else if(key == 'name'){
//     this.EnumSearch=SearchableColumnEnum.Name;
//   }else if(key == 'phone'){
//     this.EnumSearch=SearchableColumnEnum.Phone;
//   }

//   // debugger;
//   let payload=buildSearchPayload(value,this.rows,this.EnumSearch);
//   this._delegateServices.search(payload).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
//     this.itemsTable = res.data.rows
//     console.log(this.itemsTable);
//     this.totalRecords = res.data.paginationInfo.totalRowsCount
//     // this.getAllData();
//   });
//  }
// }

// onSearch(value: any) {
//   const key = this._activeFilterKey.value();
//   if (!key || !value) return;

//   this.first = 0;

//   let enumKey: SearchableColumnEnum;

//   switch (key) {
//     case 'code':
//       enumKey = SearchableColumnEnum.Code;
//       break;
//     case 'name':
//       enumKey = SearchableColumnEnum.Name;
//       break;
//     case 'phone':
//       enumKey = SearchableColumnEnum.Phone;
//       break;
//     default:
//       return;
//   }

//   const payload = buildSearchPayload(value, this.rows, enumKey);

//   this._delegateServices.search(payload)
//     .pipe(takeUntilDestroyed(this._destroyRef))
//     .subscribe((res: any) => {
//       // this.itemsTable = [...res.data.rows]; 
//       this.itemsTable = [];
// setTimeout(() => {
//   this.itemsTable = [...res.data.rows];
// });
//       console.log(this.itemsTable);
//       this.totalRecords = res.data.paginationInfo.totalRowsCount;
//     });
// }

onSearch(value: any) {

  this.first = 0;
 
  const dataActive=value;
  console.log(dataActive);
  // if (!dataActive.key || !dataActive.value) {
  //   this.getAllData();
  //   return;
  // };

  if (!dataActive?.key || !dataActive?.value?.trim()) {
    this.getAllData();
    return;
  }




  let enumKey: SearchableColumnEnum;

  switch (dataActive.key) {
    case 'code':
      enumKey = SearchableColumnEnum.Code;
      break;
    case 'name':
      enumKey = SearchableColumnEnum.Name;
      break;
    case 'phone':
      enumKey = SearchableColumnEnum.Phone;
      break;
    default:
      return;
  }

  const payload = buildSearchPayload(dataActive.value, this.rows, enumKey);

  this._delegateServices.searchWithoutSkipLoader(payload).subscribe((res: any) => {
    this.itemsTable = [...res.data.rows];
    this.totalRecords = res.data.paginationInfo.totalRowsCount;
        this.cdr.detectChanges();
  });
}
}
