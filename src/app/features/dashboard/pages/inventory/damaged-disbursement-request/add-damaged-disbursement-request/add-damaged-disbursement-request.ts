import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-add-damaged-disbursement-request',
  imports: [PageHeader, DatePicker, NgSelectComponent],
  templateUrl: './add-damaged-disbursement-request.html',
  styleUrl: './add-damaged-disbursement-request.scss',
})
export class AddDamagedDisbursementRequest {
  
  
  
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
  label:'مستكشف طلب صرف تالف ',
  link:'/damaged-disbursement-request/explorer'
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



damageReasons = [
  { id: 1, name: 'انتهاء صلاحية' },
  { id: 2, name: 'كسر' },
  { id: 3, name: 'عيب تصنيع' },
  { id: 4, name: 'سوء تخزين' },
  { id: 5, name: 'تالف أثناء النقل' },
  { id: 6, name: 'أخرى' }
];

constructor() {
  // بيانات تجريبية
  this.itemsTable = [
    {
      id: 1,
      code: 'PRD-001',
      itemName: 'شاشة Dell',
      unit: 'قطعة',
      balance: 20,
      damagedQty: 2,
      cost: 2500,
      total: 5000,
      damageReasonId: 2,
      notes: ''
    },
    {
      id: 2,
      code: 'PRD-005',
      itemName: 'كيبورد',
      unit: 'قطعة',
      balance: 100,
      damagedQty: 5,
      cost: 150,
      total: 750,
      damageReasonId: 3,
      notes: ''
    }
  ];
}

get totalQty(): number {
  return this.itemsTable.reduce(
    (sum: number, item: any) => sum + Number(item.damagedQty || 0),
    0
  );
}

get totalAmount(): number {
  return this.itemsTable.reduce(
    (sum: number, item: any) => sum + Number(item.total || 0),
    0
  );
}

onQtyChange(item: any): void {

  if (item.damagedQty > item.balance) {
    item.damagedQty = item.balance;
  }

  if (item.damagedQty < 0) {
    item.damagedQty = 0;
  }

  item.total = item.damagedQty * item.cost;
}

addRow(): void {

  this.itemsTable.push({
    id: Date.now(),
    code: '',
    itemName: '',
    unit: '',
    balance: 0,
    damagedQty: 0,
    cost: 0,
    total: 0,
    damageReasonId: null,
    notes: ''
  });

}

removeRow(index: number): void {
  this.itemsTable.splice(index, 1);
}

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
