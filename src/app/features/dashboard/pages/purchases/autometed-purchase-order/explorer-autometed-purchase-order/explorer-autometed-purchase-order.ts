import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-autometed-purchase-order',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-autometed-purchase-order.html',
  styleUrl: './explorer-autometed-purchase-order.scss',
})
export class ExplorerAutometedPurchaseOrder {

    // !!!!!!!!!!!!!!!1 Services



  // !!!!!!!!!!!!!!! Property
   first: number = 0;
   rows: number = 10;
   dataAddButton={
      label:'اضافه طلب الشراء جديد',
      action:'/autometed-purchase-order/add'
   }

   filteringData=[
      {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-4',placeholder:'رقم الفاتورة'},
      {label:'المرجع',key:'returnsNumber',type:'text',value:'' , class:'col-span-4',placeholder:'رقم المرجع'},
      {label:'المورد',key:'supplier',type:'text',value:'' , class:'col-span-4',placeholder:'المورد'},
   ]



  //  !!!!!!!!!!!!! Methods
itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  reference: `REF-${2000 + i}`,
  supplier: `Supplier ${i + 1}`,
  totalQty: Math.floor(Math.random() * 100) + 1
}));

// itemsTable:any = [];

onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
