import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { PageHeaderSearch } from "../../../../../../shared/ui/page-header-search/page-header-search";

@Component({
  selector: 'app-explorer-inventory-adjustment',
  imports: [Paginator, PageHeaderSearch],
  templateUrl: './explorer-inventory-adjustment.html',
  styleUrl: './explorer-inventory-adjustment.scss',
})
export class ExplorerInventoryAdjustment {
   dataAddButton={
      label:' تسوية المخزون ',
      action:'/inventory-adjustment/add'
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
      {label:'رقم التسوية',key:'invoiceNumber',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'رقم التسوية'},
      {label:'رقم المرجع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-6',placeholder:'رقم المرجع'},

   ]
// !!!!!!!!!!! Method
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

} 
}
