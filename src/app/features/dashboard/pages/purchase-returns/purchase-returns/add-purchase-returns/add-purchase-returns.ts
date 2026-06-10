import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { NgSelectComponent } from "@ng-select/ng-select";
import { DatePicker } from "primeng/datepicker";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-add-purchase-returns',
  imports: [PageHeader, NgSelectComponent, DatePicker, Dialog],
  templateUrl: './add-purchase-returns.html',
  styleUrl: './add-purchase-returns.scss',
})
export class AddPurchaseReturns {
  
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
  label:'مستكشف  مرتجعات  مشتريات ',
  link:'/purchase-returns/explorer'
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

// itemsTable:any=[
  
//   { id: 1, name: 'قلم', unit: 'قطعة', quantity: 50 },
//   { id: 2, name: 'دفتر', unit: 'قطعة', quantity: 30 },
//   { id: 3, name: 'مسطرة', unit: 'قطعة', quantity: 20 },
//   { id: 4, name: 'ممحاة', unit: 'قطعة', quantity: 40 },
//   { id: 5, name: 'كشكول', unit: 'قطعة', quantity: 25 },
//   { id: 6, name: 'آلة حاسبة', unit: 'قطعة', quantity: 10 },
//   { id: 7, name: 'ملف', unit: 'قطعة', quantity: 15 },
//   { id: 8, name: 'دباسة', unit: 'قطعة', quantity: 8 },
//   { id: 9, name: 'ورق A4', unit: 'علبة', quantity: 12 },
//   { id: 10, name: 'قلم رصاص', unit: 'قطعة', quantity: 60 }

// ]

itemsTable: any[] = [
  { id: 1, name: 'لاب توب Dell', unit: 'قطعة', qty: 5, returned: 1, returnAmount: 15000 },
  { id: 2, name: 'ماوس Logitech', unit: 'قطعة', qty: 20, returned: 2, returnAmount: 400 },
  { id: 3, name: 'كيبورد HP', unit: 'قطعة', qty: 15, returned: 1, returnAmount: 300 },
  { id: 4, name: 'شاشة Samsung', unit: 'قطعة', qty: 10, returned: 0, returnAmount: 0 },
  { id: 5, name: 'طابعة Canon', unit: 'قطعة', qty: 3, returned: 1, returnAmount: 4000 },

  { id: 6, name: 'هارد SSD', unit: 'قطعة', qty: 12, returned: 2, returnAmount: 2400 },
  { id: 7, name: 'فلاش USB', unit: 'قطعة', qty: 50, returned: 5, returnAmount: 500 },
  { id: 8, name: 'راوتر TP-Link', unit: 'قطعة', qty: 8, returned: 1, returnAmount: 900 },
  { id: 9, name: 'سماعات Sony', unit: 'قطعة', qty: 6, returned: 0, returnAmount: 0 },
  { id: 10, name: 'كاميرا مراقبة', unit: 'قطعة', qty: 4, returned: 1, returnAmount: 1800 },

  { id: 11, name: 'كرسي مكتب', unit: 'قطعة', qty: 10, returned: 2, returnAmount: 2400 },
  { id: 12, name: 'مكتب خشب', unit: 'قطعة', qty: 2, returned: 0, returnAmount: 0 },
  { id: 13, name: 'ورق A4', unit: 'كرتونة', qty: 30, returned: 3, returnAmount: 450 },
  { id: 14, name: 'أقلام حبر', unit: 'علبة', qty: 40, returned: 4, returnAmount: 200 },
  { id: 15, name: 'دفاتر', unit: 'قطعة', qty: 60, returned: 6, returnAmount: 120 },

  { id: 16, name: 'مكيف هواء', unit: 'قطعة', qty: 2, returned: 0, returnAmount: 0 },
  { id: 17, name: 'ثلاجة', unit: 'قطعة', qty: 1, returned: 0, returnAmount: 0 },
  { id: 18, name: 'غسالة', unit: 'قطعة', qty: 1, returned: 1, returnAmount: 7000 },
  { id: 19, name: 'ميكروويف', unit: 'قطعة', qty: 3, returned: 1, returnAmount: 2500 },
  { id: 20, name: 'مروحة', unit: 'قطعة', qty: 10, returned: 2, returnAmount: 600 }
];

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
