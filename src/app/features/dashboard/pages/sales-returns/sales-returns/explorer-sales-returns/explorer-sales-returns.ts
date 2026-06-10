import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-sales-returns',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-sales-returns.html',
  styleUrl: './explorer-sales-returns.scss',
})
export class ExplorerSalesReturns {
  //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه مرتجعات مبيعات جديده',
      action:'/sales-returns/add'
   }

   
filteringData=[
  {label:'رقم الفاتورة',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الفاتورة'},
      {label:'رقم الجوال',key:'phoneNumber',type:'text',value:'' , class:'col-span-12 md:col-span-4',placeholder:'رقم الجوال'},
      {label:'اسم العميل',key:'supplier',type:'text',value:'' , class:'col-span-12 md:col-span-4',placeholder:'العميل'},
   ]

     first: number = 0;
   rows: number = 10;

   itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  warehouse: ['المخزن الرئيسي', 'مخزن 1', 'مخزن 2'][i % 3],
  supplier: `عميل ${i + 1}`,
  paymentMethod: ['كاش', 'تحويل بنكي', 'آجل'][i % 3],
  qty: Math.floor(Math.random() * 100) + 1,
  totalDiscount:'24',
  totalAmount: Math.floor(Math.random() * 50000) + 1000
}));


// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}
}
