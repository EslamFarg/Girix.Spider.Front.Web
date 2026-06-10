import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { NgSelectComponent } from "@ng-select/ng-select";
import { DatePicker } from "primeng/datepicker";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-add-inventory-transfer-receive',
  imports: [PageHeader, NgSelectComponent, DatePicker, Dialog],
  templateUrl: './add-inventory-transfer-receive.html',
  styleUrl: './add-inventory-transfer-receive.scss',
})
export class AddInventoryTransferReceive {
  
   // !!!!!!!!!!!!!!!!! Services

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'قبول', type: 'primary', action: 'save' },
  { label: 'رفض',  action: 'save' },
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
  label:'مستكشف استلام التحويل المخزني ',
  link:'/inventory-transfer-receive/explorer'
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
