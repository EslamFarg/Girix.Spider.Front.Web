import { Component } from '@angular/core';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-add-payment-voucher',
  imports: [PageHeader, DatePicker, NgSelectComponent, Dialog],
  templateUrl: './add-payment-voucher.html',
  styleUrl: './add-payment-voucher.scss',
})
export class AddPaymentVoucher {
   
   // !!!!!!!!!!!!!!!!! Services

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
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
  label:'مستكشف سند صرف مرتجعات',
  link:'/payment-voucher/explorer'
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

tableData = [
  {id:1, code:'ITM-001', name:'لاب توب Dell', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:5, price:15000, discountRate:5, discount:3750, tax:750, total:72000},
  {id:2, code:'ITM-002', name:'ماوس Logitech', warehouse:'مخزن فرعي', unit:'قطعة', qty:20, price:200, discountRate:0, discount:0, tax:40, total:4040},
  {id:3, code:'ITM-003', name:'كيبورد HP', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:15, price:300, discountRate:3, discount:135, tax:67.5, total:4432.5},
  {id:4, code:'ITM-004', name:'شاشة Samsung', warehouse:'مخزن 1', unit:'قطعة', qty:10, price:2500, discountRate:2, discount:500, tax:125, total:24625},
  {id:5, code:'ITM-005', name:'طابعة Canon', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:3, price:4000, discountRate:0, discount:0, tax:200, total:12200},

  {id:6, code:'ITM-006', name:'هارد SSD', warehouse:'مخزن 2', unit:'قطعة', qty:12, price:1200, discountRate:4, discount:576, tax:72, total:14016},
  {id:7, code:'ITM-007', name:'فلاش USB', warehouse:'مخزن فرعي', unit:'قطعة', qty:50, price:100, discountRate:5, discount:250, tax:25, total:4775},
  {id:8, code:'ITM-008', name:'راوتر TP-Link', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:8, price:900, discountRate:0, discount:0, tax:45, total:7245},
  {id:9, code:'ITM-009', name:'سماعات Sony', warehouse:'مخزن 1', unit:'قطعة', qty:6, price:700, discountRate:2, discount:84, tax:35, total:4131},
  {id:10, code:'ITM-010', name:'كاميرا مراقبة', warehouse:'مخزن 2', unit:'قطعة', qty:4, price:1800, discountRate:3, discount:216, tax:90, total:6990},

  {id:11, code:'ITM-011', name:'كرسي مكتب', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:10, price:1200, discountRate:5, discount:600, tax:60, total:11460},
  {id:12, code:'ITM-012', name:'مكتب خشب', warehouse:'مخزن 1', unit:'قطعة', qty:2, price:5000, discountRate:0, discount:0, tax:250, total:10250},
  {id:13, code:'ITM-013', name:'ورق A4', warehouse:'مخزن فرعي', unit:'كرتونة', qty:30, price:150, discountRate:2, discount:90, tax:7.5, total:4417.5},
  {id:14, code:'ITM-014', name:'أقلام حبر', warehouse:'المخزن الرئيسي', unit:'علبة', qty:40, price:50, discountRate:0, discount:0, tax:2.5, total:2025},
  {id:15, code:'ITM-015', name:'دفاتر', warehouse:'مخزن 2', unit:'قطعة', qty:60, price:20, discountRate:1, discount:12, tax:1, total:1189},

  {id:16, code:'ITM-016', name:'مكيف هواء', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:2, price:8000, discountRate:5, discount:800, tax:400, total:15600},
  {id:17, code:'ITM-017', name:'ثلاجة', warehouse:'مخزن 1', unit:'قطعة', qty:1, price:10000, discountRate:0, discount:0, tax:500, total:10500},
  {id:18, code:'ITM-018', name:'غسالة', warehouse:'مخزن 2', unit:'قطعة', qty:1, price:7000, discountRate:3, discount:210, tax:350, total:7140},
  {id:19, code:'ITM-019', name:'ميكروويف', warehouse:'مخزن فرعي', unit:'قطعة', qty:3, price:2500, discountRate:2, discount:150, tax:125, total:7475},
  {id:20, code:'ITM-020', name:'مروحة', warehouse:'المخزن الرئيسي', unit:'قطعة', qty:10, price:300, discountRate:0, discount:0, tax:15, total:3015}
];


itemsData = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `صنف ${i + 1}`,
  unit: i % 2 === 0 ? 'قطعة' : 'علبة',
  quantity: Math.floor(Math.random() * 20) + 1,
  returned: Math.floor(Math.random() * 5),
  amount: Math.floor(Math.random() * 300) + 50
}));

returnsData: any = Array.from({ length: 20 }, (_, i) => {
  const totalAmount = Math.floor(Math.random() * 5000) + 1000;
  const discount = Math.floor(Math.random() * 500);
  const paidAmount = Math.floor(Math.random() * (totalAmount - discount));
  const remaining = totalAmount - discount - paidAmount;

  return {
    id: i + 1,
    invoiceNumber: `INV-${1000 + i}`,
    totalAmount: totalAmount,      // المبلغ الإجمالي
    paidAmount: paidAmount,        // تنزيل مبلغ
    discount: discount,            // الخصم
    remaining: remaining           // المتبقي
  };
});


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
