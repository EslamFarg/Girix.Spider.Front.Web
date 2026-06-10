import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-damaged-disbursement-request',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-damaged-disbursement-request.html',
  styleUrl: './explorer-damaged-disbursement-request.scss',
})
export class ExplorerDamagedDisbursementRequest {
  dataAddButton={
      label:'طلب صرف تالف ',
      action:'/damaged-disbursement-request/add'
   }
     first: number = 0;
   rows: number = 10;

itemsTable: any[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  proofNumber: `INV-${1000 + i}`,
  reference: `REF-${2000 + i}`,
  date: new Date(2026, 2, i + 1).toISOString().split('T')[0],
  store: `مخزن ${((i % 3) + 1)}`, // 3 مخازن
  employee: `موظف ${((i % 5) + 1)}`, // 5 موظفين
  total: Math.floor(Math.random() * 5000) + 500
}));


filteringData=[
      {label:'رقم الفاتورة',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الفاتورة'},
      {label:'رقم المرجع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم المرجع'},
      {label:'رقم الجوال',key:'phoneNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الجوال'},
   ]
// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

} 
}
