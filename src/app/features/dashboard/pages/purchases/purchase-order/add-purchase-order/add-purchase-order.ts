import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-add-purchase-order',
  standalone: true,
  imports: [CommonModule, PageHeader, DatePickerModule, FormsModule, NgSelectModule],
  templateUrl: './add-purchase-order.html',
  styleUrl: './add-purchase-order.scss',
})
export class AddPurchaseOrder {

  
  
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
  label:'مستكشف طلب الشراء',
  link:'/purchase-order/explorer'
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



itemsTable:any=[
  
  { id: 1, name: 'قلم', unit: 'قطعة', quantity: 50 },
  { id: 2, name: 'دفتر', unit: 'قطعة', quantity: 30 },
  { id: 3, name: 'مسطرة', unit: 'قطعة', quantity: 20 },
  { id: 4, name: 'ممحاة', unit: 'قطعة', quantity: 40 },
  { id: 5, name: 'كشكول', unit: 'قطعة', quantity: 25 },
  { id: 6, name: 'آلة حاسبة', unit: 'قطعة', quantity: 10 },
  { id: 7, name: 'ملف', unit: 'قطعة', quantity: 15 },
  { id: 8, name: 'دباسة', unit: 'قطعة', quantity: 8 },
  { id: 9, name: 'ورق A4', unit: 'علبة', quantity: 12 },
  { id: 10, name: 'قلم رصاص', unit: 'قطعة', quantity: 60 }

]

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
