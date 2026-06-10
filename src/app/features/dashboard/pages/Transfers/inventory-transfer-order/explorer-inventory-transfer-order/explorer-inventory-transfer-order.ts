import { Component } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-explorer-inventory-transfer-order',
  imports: [PageHeaderSearch, Paginator],
  templateUrl: './explorer-inventory-transfer-order.html',
  styleUrl: './explorer-inventory-transfer-order.scss',
})
export class ExplorerInventoryTransferOrder {
    //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه طلب التحويلات',
      action:'/inventory-transfer-order/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  voucherNumber: `VCH-${1000 + i}`, // رقم السند
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  warehouse: `مخزن-${i + 1}`, // المرجع
  customerName: `عميل ${i + 1}`,
  totalAmount: Math.floor(Math.random() * 5000) + 500,
  validUntil: new Date(2026, 2, i + 10).toISOString().split('T')[0], // صالحه حتى
}));


filteringData=[
      {label:'رقم الطلب',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'رقم الفاتورة'},
      {label:'اسم العميل',key:'customerName',type:'text',value:'' , class:'col-span-12 md:col-span-6',placeholder:'اسم العميل'},
   ]
// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
