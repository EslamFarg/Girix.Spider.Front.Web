import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-add-incomming-checks',
  imports: [PageHeader, DatePicker, NgSelectComponent, Dialog],
  templateUrl: './add-incomming-checks.html',
  styleUrl: './add-incomming-checks.scss',
})
export class AddIncommingChecks {
  
   // !!!!!!!!!!!!!!!!! Services

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
  { label: 'طباعه', action: 'print' }
];


   visible: boolean = false;

explorerBtn={
  label:' مستكشف الشيكات ',
  link:'/accounts-parent/incomming-checks/explorer'
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




accountExlorer=Array.from({length:20},(_,i)=>({
  id:1,
  note:'هذا النص  يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا ال....',
  depit:'1000',
  credit:'0',
  total:'1000',
  
}))

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




    showDialog() {
        this.visible = true;
    }
}
