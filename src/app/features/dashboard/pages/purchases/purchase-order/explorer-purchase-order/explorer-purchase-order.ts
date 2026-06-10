import { Component, computed, effect } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-explorer-purchase-order',
  imports: [PageHeaderSearch, PaginatorModule],
  templateUrl: './explorer-purchase-order.html',
  styleUrl: './explorer-purchase-order.scss',
})
export class ExplorerPurchaseOrder {
  
  // !!!!!!!!!!!!!!!1 Services



  // !!!!!!!!!!!!!!! Property
   first: number = 0;
   rows: number = 10;
   dataAddButton={
      label:'اضافه طلب الشراء جديد',
      action:'/purchase-order/add'
   }

   filteringData:any=[
    {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-4',placeholder:'رقم الفاتورة'},
    {label:'المرجع',key:'returnsNumber',type:'text',value:'' , class:'col-span-4',placeholder:'المرجع'},
    {label:'المورد',key:'supplier',type:'text',value:'' , class:'col-span-4',placeholder:'المورد'},
   ]



   getDataFiltering=computed(()=>{
     return this.filteringData
   })



  // getDataFiltering = computed(() => this.filteringData());

// constructor() {
//   effect(() => {
//     console.log(this.getDataFiltering());
//   });
// }




  //  !!!!!!!!!!!!! Methods
itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  reference: `REF-${2000 + i}`,
  supplier: `Supplier ${i + 1}`,
  totalQty: Math.floor(Math.random() * 100) + 1
}));


onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
