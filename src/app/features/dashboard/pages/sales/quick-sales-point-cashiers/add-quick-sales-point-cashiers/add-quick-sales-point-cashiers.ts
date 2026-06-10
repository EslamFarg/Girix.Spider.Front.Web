import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { Button } from "primeng/button";
import { NgSelectComponent } from "@ng-select/ng-select";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-add-quick-sales-point-cashiers',
  imports: [NgIf, NgFor, NgClass, DialogModule, Button, NgSelectComponent, RouterLink],
  templateUrl: './add-quick-sales-point-cashiers.html',
  styleUrl: './add-quick-sales-point-cashiers.scss',
})
export class AddQuickSalesPointCashiers {

  // !!!!!!!!!!! Property
  search = '';
open = false;
activeIndex = -1;

items = Array.from({ length: 50 }, (_, i) => ({
  name: `صنف ${i + 1}`,
  code: `#${1000 + i}`
}));

filtered = [...this.items];

selectedGroup = 1;
showdropDownPopup = false;
groups = [
  { id: 1, name: 'بيتزا' },
  { id: 2, name: 'برجر' },
  { id: 3, name: 'شاورما' },
  { id: 4, name: 'مقبلات' },
  { id: 5, name: 'مشروبات' },
  { id: 6, name: 'حلويات' },
  { id: 7, name: 'فراخ' },
  { id: 8, name: 'لحوم' },
  { id: 9, name: 'سندوتشات' },
  { id: 10, name: 'مأكولات بحرية' },
  { id: 11, name: 'سلطات' },
  { id: 12, name: 'عصائر' },
  { id: 13, name: 'قهوة' },
  { id: 14, name: 'إفطار' },
  { id: 15, name: 'وجبات سريعة' },
  { id: 16, name: 'دايت فود' },
  { id: 17, name: 'أطفال' },
  { id: 18, name: 'إضافات' },
  { id: 19, name: 'عروض' },
  { id: 20, name: 'الأكثر مبيعًا' }
];


itemsProduct = Array.from({ length: 60 }, (_, i) => {
  // const groupId = (i % 20) + 1;

  return {
    id: i + 1,
    name: `منتج ${i + 1}`,
    price: Math.floor(Math.random() * 200) + 20,
    // groupId: groupId,
    image: ''
  };
});


  visibleInvoice: boolean = false;
 visibleCustomer: boolean = false; 
 visiblePaid: boolean = false;
  customers = [
    { id: 0, name: 'عميل نقدي' },
    { id: 1, name: 'عميل 1' },
    { id: 2, name: 'عميل 2' },
    { id: 3, name: 'عميل 3' },
    { id: 4, name: 'عميل 4' },]


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
// !!!!!!!!!!! Methods 


@HostListener('document:click', ['$event'])

hideDropdown(event: any) {
const target = event.target as HTMLElement;
if (!target.closest('.options_container') && !target.closest('.icon')) {
  this.showdropDownPopup = false;
}
}
onSearch(event: any) {
  this.search = event.target.value;

  this.filtered = this.items.filter(item =>
    item.name.includes(this.search) ||
    item.code.includes(this.search)
  );

  this.open = true;
  this.activeIndex = -1;
}

select(item: any) {
  this.search = item.name;
  this.open = false;
}


// get filteredItems() {
  // return this.itemsProduct.filter(item => item.groupId === this.selectedGroup);
// }

clear() {
  this.search = '';
  this.filtered = this.items;
}


toggleOptions(){
  this.showdropDownPopup = !this.showdropDownPopup;
}

  showDialogInvoice() {

        this. visibleInvoice = true;
        this.showdropDownPopup = false;
    }
  showDialogCustomer() {

        this. visibleCustomer = true;
        this.showdropDownPopup = false;
    }

    showDialogPaid(){
      this. visiblePaid = true;
      this.showdropDownPopup = false;
    }
}
