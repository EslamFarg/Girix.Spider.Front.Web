import { Component, forwardRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";
import { InputAttachment } from "../../../../../../shared/ui/input-attachment/input-attachment";
import { FormBuilder, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-employees',
  imports: [RouterLink, DatePicker, NgSelectComponent, Dialog, InputAttachment,
    ReactiveFormsModule
  ],
  templateUrl: './add-employees.html',
  styleUrl: './add-employees.scss',
  
})
export class AddEmployees {
      // !!!!!!!!!!!!!!!!! Services
      _fb:FormBuilder=inject(FormBuilder);
      formAttachment=this._fb.group({
        attachment:['']
      })

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
  { label: 'طباعه', action: 'print' }
];



   visible: boolean = false;
   visibleReject: boolean = false;

explorerBtn={
  label:' مستكشف  سند صرف مبسط ',
  link:'/expenses/simple-payment-voucher/explorer'
}


paymentMethod=[
  {
    id:1,
    name:'كاش'
  },
  {
    id:1,
    name:'شبكة'
  },
  {
    id:1,
    name:'حوالة'
  }
]


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


showDialogReject(){
  this.visibleReject = true
}



    showDialog() {
        this.visible = true;
    }


    imagePreview: string | ArrayBuffer | null = null;

onFileChange(event: any) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    this.imagePreview = reader.result;
  };
  reader.readAsDataURL(file);
}
}
