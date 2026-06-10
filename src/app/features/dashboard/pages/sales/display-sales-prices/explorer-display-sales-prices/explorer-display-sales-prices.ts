import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-display-sales-prices',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-display-sales-prices.html',
  styleUrl: './explorer-display-sales-prices.scss',
})
export class ExplorerDisplaySalesPrices {
  //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه عرض اسعار المبيعات',
      action:'/display-sales-prices/add'
   }
     first: number = 0;
   rows: number = 10;

   itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  returnsNumber: `RET-${1000 + i}`,
  customerName: `عميل ${i + 1}`,
  qty: Math.floor(Math.random() * 100) + 1,
}));


filteringData=[
      {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الفاتورة'},
      {label:'رقم المرجع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم المرجع'},
      {label:'رقم الجوال',key:'phoneNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الجوال'},
      {label:'اسم العميل',key:'customerName',type:'text',value:'' , class:'col-span-12',placeholder:'اسم العميل'},
   ]
// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
