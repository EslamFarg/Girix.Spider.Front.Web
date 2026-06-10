import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-internal-exchange-permit',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-internal-exchange-permit.html',
  styleUrl: './explorer-internal-exchange-permit.scss',
})
export class ExplorerInternalExchangePermit {
  
   //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه أذن صرف داخلي',
      action:'/internal-exchange-permit/add'
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
      {label:'المرجع',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'المرجع'},
      {label:'المرجع',key:'customerName',type:'text',value:'' , class:'col-span-12 md:col-span-6',placeholder:'المرجع'},
      {label:'الحساب',key:'customerName',type:'text',value:'' , class:'col-span-12',placeholder:'الحساب'},
   ]
// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
