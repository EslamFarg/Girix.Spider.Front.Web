import { ChangeDetectorRef, Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { PaginatorModule } from 'primeng/paginator';
import { PurchaseOrderService } from '../services/purchase-order-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";
import { MessageService } from 'primeng/api';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { Router } from '@angular/router';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';

@Component({
  selector: 'app-explorer-purchase-order',
  imports: [PageHeaderSearch, PaginatorModule, SharedConfirmDialog],
  templateUrl: './explorer-purchase-order.html',
  styleUrl: './explorer-purchase-order.scss',
})
export class ExplorerPurchaseOrder {
  // !!!!!!!!!!!!!!!1 Services
  _purchaseOrderService=inject(PurchaseOrderService)
  _destroyRef:DestroyRef=inject(DestroyRef)
  _messageServices=inject(MessageService)
  _sharedStateServices=inject(SharedStateServices)
  _router:Router=inject(Router)
  cdr=inject(ChangeDetectorRef)


  // !!!!!!!!!!!!!!! Property
   first: number = 0;
   rows: number = 10;
   showDeleteDialog=false
   idDelete:number=0
   dataAddButton={
      label:'اضافه طلب الشراء جديد',
      action:'/purchase-order/add'
   }
   filteringData:any=[
    {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-4',placeholder:'رقم الفاتورة'},
    {label:'المرجع',key:'InvoiceReference',type:'text',value:'' , class:'col-span-4',placeholder:'المرجع'},
    {label:'المورد',key:'SupplayerNameAr',type:'text',value:'' , class:'col-span-4',placeholder:'المورد'},
   ]



   getDataFiltering=computed(()=>{
     return this.filteringData
   })
   totalRecords=0


  // getDataFiltering = computed(() => this.filteringData());

// constructor() {
//   effect(() => {
//     console.log(this.getDataFiltering());
//   });
// }




itemsTable:any[]=[]
totalQuantity=0
  //  !!!!!!!!!!!!! Methods
ngOnInit(){
  this.getAllData()
}
// asdsad


getTotalQuantity(details: any[]): number {
  return details.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
}
getAllData(){
  const page=this.first/this.rows + 1;
  this._purchaseOrderService.getAllSendInQuery(this.first,this.rows).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
      this.itemsTable = res.data.rows
      this.totalRecords = res.data.paginationInfo.totalRowsCount
      // this.calculateTotal()
  })
}

onEditData(id:any){
  this._sharedStateServices.setSelectedId(id)
  this._router.navigate(['/purchase-order/add'])
}

delete(id:any){
  this.showDeleteDialog=true;
  this.idDelete=id
}

deleteDialog(){
  this._purchaseOrderService.delete(this.idDelete).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
    next:(res:any)=>{
      this._messageServices.add({
        severity: 'success',
        summary: 'نجاح',
        detail: 'تم الحذف بنجاح',
      })
      this.showDeleteDialog=false;
      this.getAllData()
    }
  })
}
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;
        this.getAllData()
}

// onSearch(value: any) {
//       this.first = 0;
//    const dataActive=value;
//    console.log(dataActive);
//    if (!dataActive.key || !dataActive.value) return;
 
//   //  console.log(dataActive);

   
 
 
 
//    let enumKey: SearchableColumnEnum;
 
//    switch (dataActive.key) {
//      case 'code':
//        enumKey = SearchableColumnEnum.Code;
//        break;
//      case 'name':
//        enumKey = SearchableColumnEnum.Name;
//        break;
//      case 'phone':
//        enumKey = SearchableColumnEnum.Phone;
//        break;
//      default:
//        return;
//    }
 
//    if(dataActive.key == 'invoiceNumber'){
//     this._purchaseOrderService.getById(dataActive.value).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
//       next:(res:any)=>{
//         this.itemsTable=[res.data]
//         this.totalRecords=1
//         this.cdr.detectChanges();
//       }
//     })
//    }else{
//      const payload = buildSearchPayload(dataActive.value, this.rows, enumKey);
   
//      this._purchaseOrderService.searchWithoutSkipLoader(payload).subscribe((res: any) => {
//        this.itemsTable = [...res.data.rows];
//        this.totalRecords = res.data.paginationInfo.totalRowsCount;
//            this.cdr.detectChanges();
//      });

//    }
//  }

onSearch(value: any) {

  this.first = 0;

  if (!value.key || !value.value) return;

  // if (value.key === 'invoiceNumber') {

  //   this._purchaseOrderService
  //     .getByIdInQuery(value.value)
  //     .pipe(takeUntilDestroyed(this._destroyRef))
  //     .subscribe({
  //       next: (res: any) => {
  //         this.itemsTable = [res.data];
  //         this.totalRecords = 1;
  //         this.cdr.detectChanges();
  //       }
  //     });

  //   return;
  // }

  let enumKey: SearchableColumnEnum;

  switch (value.key) {
    case 'invoiceNumber':
      enumKey = SearchableColumnEnum.InvoiceNumber;
      break;

    case 'InvoiceReference':
      enumKey = SearchableColumnEnum.InvoiceReference;
      break;

    case 'SupplayerNameAr':
      enumKey = SearchableColumnEnum.SupplayerNameAr;
      break;

    default:
      return;
  }

  const payload = buildSearchPayload(value.value, this.rows, enumKey);

  this._purchaseOrderService
    .searchWithoutSkipLoader(payload)
    .subscribe((res: any) => {
      this.itemsTable = res.data.rows;
      this.totalRecords = res.data.paginationInfo.totalRowsCount;
      this.cdr.detectChanges();
    });
}


}
