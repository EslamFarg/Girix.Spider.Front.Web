import { Component } from '@angular/core';
import { Paginator } from "primeng/paginator";
import { DatePicker } from "primeng/datepicker";
import { Dialog } from "primeng/dialog";
import { Button } from "primeng/button";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-invoice-draft',
  imports: [Paginator, DatePicker, Dialog, Button,FormsModule],
  templateUrl: './purchase-invoice-draft.html',
  styleUrl: './purchase-invoice-draft.scss',
})
export class PurchaseInvoiceDraft {
    //!!!!!!!!!! Property 

     selectedSize='25'
  visible: boolean = false;

  dataAddButton={
      label:'اضافه مرتجعات مشتريات جديده',
      action:'/multiply-purchase-returns/add'
   }

   
   filteringData=[
  {label:'رقم الفاتورة',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم الفاتورة'},
      {label:'رقم طلب المرتجع',key:'returnsNumber',type:'text',value:'',class:'col-span-12 md:col-span-4',placeholder:'رقم طلب المرتجع'},
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
  totalDiscount:'24',
  totalAmount: Math.floor(Math.random() * 50000) + 1000
}));


// !!!!!!!!!!! Methods
onPageChange(event:any){
   this.first = event.first ?? 0;
        this.rows = event.rows ?? 10;

}

    showDialog() {
        this.visible = true;
    }

}
