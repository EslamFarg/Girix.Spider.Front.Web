import { ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { FormBuilder } from '@angular/forms';
import { Suppliers } from '../services/suppliers';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SupplierModel } from '../models/supplier';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explorer-suppliers',
  imports: [Paginator, PageHeaderSearch, SharedConfirmDialog],
  templateUrl: './explorer-suppliers.html',
  styleUrl: './explorer-suppliers.scss',
})
export class ExplorerSuppliers {
  // !!!!!!!!! Services
  _supplierServices = inject(Suppliers);
  _destroyRef:DestroyRef=inject(DestroyRef);
  _messageServices=inject(MessageService);
  _sharedStateServices=inject(SharedStateServices);
  _router:Router=inject(Router);


  // !!!!!!!!! Properties
  
  dataAddButton={
      label:'أضافة مورد ',
      action:'/suppliers/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: SupplierModel[] = [];

totalRecords = 0;

filteringData=[
  {label:'كود المورد',key:'code',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'كود المورد'},
  {label:'اسم المورد',key:'name',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'اسم المورد'},
      {label:'رقم الجوال',key:'phone',type:'text',value:'',class:'col-span-12 ',placeholder:'رقم الجوال'},
   ]
   cdr = inject(ChangeDetectorRef)
   showDeleteDialog=false;
   deleteId=0;
// !!!!!!!!!!! Method

ngOnInit(): void {
  this.getAllData();
}
getAllData(){
  this._supplierServices.getAllSendInQuery(this.first,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.itemsTable = res.data.rows
      this.totalRecords = res.data.paginationInfo.totalRowsCount
  })
}
onPageChange(event:any){
   this.first = event.first ?? 0;
    this.rows = event.rows ?? 10;
    this.getAllData();

}

onSearch(value: any) {
 
  const dataActive=value;
  console.log(dataActive);
  if (!dataActive.key || !dataActive.value) return;




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

  this._supplierServices.searchWithoutSkipLoader(payload).subscribe((res: any) => {
    this.itemsTable = [...res.data.rows];
    this.totalRecords = res.data.paginationInfo.totalRowsCount;
        this.cdr.detectChanges();
  });
}


viewDeletePopup(id:number){
  this.deleteId=id;
  this.showDeleteDialog=true;
}


deleteDialog(){
  this._supplierServices.delete(this.deleteId).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
    this._messageServices.add({
      severity: 'success',
      summary: 'نجاح',
      detail: 'تم الحذف بنجاح',
    })
    this.deleteId=0;
    this.getAllData();
    this.showDeleteDialog=false;
  })
}


sendIdToUpdateState(id:number){
  this._sharedStateServices.setSelectedId(id);
  this._router.navigate(['suppliers/add']);
}
}




