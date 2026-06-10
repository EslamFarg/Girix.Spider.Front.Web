import { Component } from '@angular/core';
import { Dialog } from "primeng/dialog";
import { NgSelectComponent } from "@ng-select/ng-select";
import { DatePicker } from "primeng/datepicker";
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";

@Component({
  selector: 'app-add-multiply-sales-returns',
  imports: [Dialog, NgSelectComponent, DatePicker, PageHeader],
  templateUrl: './add-multiply-sales-returns.html',
  styleUrl: './add-multiply-sales-returns.scss',
})
export class AddMultiplySalesReturns {
  
   // !!!!!!!!!!!!!!!!! Services

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
  { label: 'طباعه', action: 'print' }
];

explorerBtn={
  label:'مستكشف  مرتجعات  مشتريات متعدد',
  link:'/multiply-sales-returns/explorer'
}


items=[
  {name:'sherif yehia',id:1},
  {name:'sherif yehia',id:2
  },
  {name:'sherif yehia',id:2
  },
  {name:'sherif yehia',id:2
  },
  {name:'sherif yehia',id:2
  },
  {name:'sherif yehia',id:2
  },
  {name:'sherif yehia',id:2
  },
]


   visible: boolean = false;

    showDialog() {
        this.visible = true;
    }
returnsData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  invoiceNumber: `INV-${1000 + i}`,
  items: `منتج ${i + 1}${i % 2 === 0 ? ', منتج إضافي' : ''}`,
  amount: Math.floor(Math.random() * 500) + 50
}));

itemsData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `صنف ${i + 1}`,
  unit: i % 2 === 0 ? 'قطعة' : 'علبة',
  quantity: Math.floor(Math.random() * 20) + 1,
  returned: Math.floor(Math.random() * 5),
  amount: Math.floor(Math.random() * 300) + 50
}));
// !!!!!!!!!!!!!!! Methods
handleAction(action: string) {
  switch (action) {
    case 'save':
      this.save();
      break;
    case 'reset':
      this.reset();
      break;
    case 'delete':
      this.delete();
      break;
    case 'print':
      this.print();
      break;
  }
}



save(){
  console.log('Save action triggered');
}

reset(){
  console.log('Reset action triggered');
}


delete(){
  console.log('Delete action triggered');
}

print(){
  console.log('Print action triggered');
}
}
