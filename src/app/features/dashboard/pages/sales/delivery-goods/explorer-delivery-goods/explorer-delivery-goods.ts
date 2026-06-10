import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-delivery-goods',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-delivery-goods.html',
  styleUrl: './explorer-delivery-goods.scss',
})
export class ExplorerDeliveryGoods {
  //!!!!!!!!!! Property 
  dataAddButton={
      label:'اضافه سندات تسليم البضائع جديد',
      action:'/delivery-goods/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  voucherNumber: `VCH-${1000 + i}`, // رقم السند
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  reference: `REF-${2000 + i}`, // المرجع
  customerName: `عميل ${i + 1}`,
  totalAmount: Math.floor(Math.random() * 5000) + 500,
  validUntil: new Date(2026, 2, i + 10).toISOString().split('T')[0], // صالحه حتى
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
