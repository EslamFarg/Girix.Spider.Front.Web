import { Component } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-explorer-simple-payment-voucher',
  imports: [PageHeaderSearch, Paginator],
  templateUrl: './explorer-simple-payment-voucher.html',
  styleUrl: './explorer-simple-payment-voucher.scss',
})
export class ExplorerSimplePaymentVoucher {
  
   //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه سند صرف جديد',
      action:'/expenses/simple-payment-voucher/add'
   }

   
filteringData=[
      {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الفاتورة'},
      {label:'رقم المرجع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم المرجع'},
      {label:'رقم الجوال',key:'phoneNumber',type:'text',value:'' , class:'col-span-12 md:col-span-4',placeholder:'رقم الجوال'},
      {label:'المورد',key:'supplier',type:'text',value:'' , class:'col-span-12',placeholder:'المورد'},
   ]
     first: number = 0;
   rows: number = 10;

   itemsTable:any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  warehouse: ['المخزن الرئيسي', 'مخزن 1', 'مخزن 2'][i % 3],
  supplier: `مورد ${i + 1}`,
  paymentMethod: ['كاش', 'تحويل بنكي', 'آجل'][i % 3],
  qty: Math.floor(Math.random() * 100) + 1,
  totalAmount: Math.floor(Math.random() * 50000) + 1000
}));


// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}  
}
