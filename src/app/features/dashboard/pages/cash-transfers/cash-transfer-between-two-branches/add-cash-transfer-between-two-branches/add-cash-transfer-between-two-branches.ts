import { Component } from '@angular/core';
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";

@Component({
  selector: 'app-add-cash-transfer-between-two-branches',
  imports: [DatePicker, NgSelectComponent, PageHeader],
  templateUrl: './add-cash-transfer-between-two-branches.html',
  styleUrl: './add-cash-transfer-between-two-branches.scss',
})
export class AddCashTransferBetweenTwoBranches {

  
   // !!!!!!!!!!!!!!!!! Services

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'طباعة' },
  { label: 'طباعه', action: 'print' }
];

paymentMethod=[
{
  name:'كاش',
  id:1
},
{
id:2,
name:'اجل'
},
{
  name:'شيك',
  id:3
},


]

explorerBtn={
  label:'مستكشف التحويلات النقدية ',
  link:'/cash-transfer-between-two-branches/explorer'
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



itemsTable: any = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  store: `مخزن ${((i % 3) + 1)}`, // 3 مخازن
  itemName: `صنف ${i + 1}`,
  unit: ['قطعة', 'كرتونة', 'كيلو'][i % 3], // وحدات مختلفة
  qty: Math.floor(Math.random() * 100) + 1,
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

   
showDialog() {
        this.visible = true;
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
