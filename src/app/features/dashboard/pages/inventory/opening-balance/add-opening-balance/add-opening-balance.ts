import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-add-opening-balance',
  imports: [PageHeader, DatePicker, NgSelectComponent],
  templateUrl: './add-opening-balance.html',
  styleUrl: './add-opening-balance.scss',
})
export class AddOpeningBalance {
  
  
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
  label:'مستكشف الارصده الافتتاحيه ',
  link:'/opening-balance/explorer'
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



itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  code: `C${1000 + i}`, // كود الصنف
  itemName: `صنف ${i + 1}`, // اسم الصنف
  unit: ['قطعة', 'كرتونة', 'كيلو'][i % 3], // وحدة
  qty: Math.floor(Math.random() * 100) + 1, // الكمية
  returnedQty: Math.floor(Math.random() * 20), // الكمية المرتجعة
  damagedValue: Math.floor(Math.random() * 500) + 50, // القيمة للتوالف
  notes: `ملاحظة ${i + 1}`, // ملاحظات
  tools: ['تعديل', 'حذف'], // الأدوات
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
