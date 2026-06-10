import { Component } from '@angular/core';
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-explorer-depit-notification',
  imports: [PageHeaderSearch, Paginator],
  templateUrl: './explorer-depit-notification.html',
  styleUrl: './explorer-depit-notification.scss',
})
export class ExplorerDepitNotification {
    //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه إشعار مدين',
      action:'/electronic-invoice/depit-notification/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  store: `مخزن ${((i % 3) + 1)}`, // 3 مخازن مختلفة
  customerName: `عميل ${i + 1}`,
  paymentMethod: i % 2 === 0 ? 'كاش' : 'آجل',
  qty: Math.floor(Math.random() * 100) + 1,
  totalAmount: (Math.floor(Math.random() * 5000) + 500),
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
