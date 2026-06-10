import { Component, HostListener, inject } from '@angular/core';
import { PageHeader } from "../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [PageHeader, DatePicker, NgSelectComponent, Dialog,AutoCompleteModule,FormsModule,NgClass,ReactiveFormsModule],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {

  
// !!!!!!!!!!!!!!!!! Services
_fb:FormBuilder=inject(FormBuilder)  

  // !!!!!!!!!!!!!!!!!!! Properties
  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
  { label: 'طباعه', action: 'print' }
];

ProductForm=this._fb.group({
  
});



typeProduct=[
  {
    id:1,
    name:'مخزني'
  },
  {
    id:2,
    name:'خدمي'
  },
]

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

taxValueSelect=[
  {
    id:0,
    value:0,
  },
  {
    id:0,
    value:1,
  },
  {
    id:0,
    value:5,
  },
  {
    id:0,
    value:14,
  },
  {
    id:0,
    value:15,
  },
]

explorerBtn={
  // label:'مستكشف فاتورة مبيعات',
  // link:'/display-sales-prices/explorer'
}



items: any[] = [];
    value: any;

    search(event: AutoCompleteCompleteEvent) {
        this.items = [...Array(10).keys()].map((item) => event.query + '-' + item);
    }
    

   visible: boolean = false;

    showDialog() {
        this.visible = true;
    }


 tableData = Array.from({ length: 5 }, (_, index) => ({
  id: index + 1,
  unit: index === 0 ? 'كرتونة' : index === 1 ? 'علبة' : 'حبة',
  conversionRate: index === 0 ? 6 : 1,
  baseUnit: 'حبة',
  purchasePrice: 100 + index * 10,
  retailPrice: 200 + index * 20,
  wholesalePrice: 150 + index * 15,
  barcodes: {
    primary: `12345${index}`,
    secondary: `54321${index}`
  },
  isDefault: index === 0
}));


showSearchBox: boolean = false;
selectedSearch='كود الصنف'

// !!!!!!!!!!!!!!! Methods

@HostListener('document:click', ['$event'])

onClick(event: any) {
  const targetElement = event.target.closest('.search_input') as HTMLElement;
  if(!targetElement){
    this.showSearchBox = false
  }

}


selectFilterSearch(type:'code' | 'name'){
  if(type == 'code'){
    this.selectedSearch='كود الصنف'
    this.showSearchBox = false

  }else{
    this.selectedSearch='اسم الصنف'
    this.showSearchBox = false

  }

}
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
