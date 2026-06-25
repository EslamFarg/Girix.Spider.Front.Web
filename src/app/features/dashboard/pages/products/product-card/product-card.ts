import { Component, HostListener, inject } from '@angular/core';
import { PageHeader } from "../../../../../shared/ui/page-header/page-header";
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";
import { AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { BUTTON_CONFIG } from '../../../../../shared/config/button-cofig';
import { FormError } from "../../../../../shared/ui/form-error/form-error";
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';

@Component({
  selector: 'app-product-card',
  imports: [PageHeader, DatePicker, NgSelectComponent, Dialog, AutoCompleteModule, FormsModule, NgClass, ReactiveFormsModule, FormError],
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

  vatTypes = [
    { textVat: 'E (معفي من الضريبة)', valueVat: 'E' },
    { textVat: 'S (خاضع للضريبة بنسبة قياسية 5% أو 15%)', valueVat: 'S' },
    { textVat: 'Z (خاضع لضريبة بنسبة صفر)', valueVat: 'Z' },
    { textVat: 'O (عكس ضريبي Reverse Charge)', valueVat: 'O' }
  ];

  exemptionReasons = [
    { text: 'الخدمات المالية', value: 'VATEX-SA-29' },
    { text: 'عقد تأمين على الحياة', value: 'VATEX-SA-29-7' },
    { text: 'التوريدات العقارية المعفاة من الضريبة', value: 'VATEX-SA-30' },
    { text: 'التوريدات الخاضعة للضريبة', value: 'S' },
    { text: 'صادرات السلع من المملكة', value: 'VATEX-SA-32' },
    { text: 'صادرات الخدمات من المملكة', value: 'VATEX-SA-33' },
    { text: 'النقل الدولي للسلع', value: 'VATEX-SA-34-1' },
    { text: 'النقل الدولي (نوع 2)', value: 'VATEX-SA-34-2' },
    { text: 'خدمات مرتبطة بالنقل الدولي للركاب', value: 'VATEX-SA-34-3' },
    { text: 'توريد وسائل النقل المؤهلة', value: 'VATEX-SA-34-4' },
    { text: 'خدمات نقل السلع أو الركاب', value: 'VATEX-SA-34-5' },
    { text: 'معدات ومواد خاصة', value: 'VATEX-SA-35' },
    { text: 'سلع معاد تصديرها', value: 'VATEX-SA-36' },
    { text: 'الخدمات التعليمية الخاصة', value: 'VATEX-SA-EDU' },
    { text: 'الخدمات الصحية الخاصة', value: 'VATEX-SA-HEA' },
    { text: 'توريد سلع عسكرية', value: 'VATEX-SA-MLTRY' },
    { text: 'سبب آخر يحدد حسب الحالة', value: 'VATEX-SA-OOS' }
  ];


buttonConfig=BUTTON_CONFIG;
isEditMode = false;

productForm = this._fb.group({
  code: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100)]],
  nameAr: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
  nameEn: ['',[Validators.required,Validators.minLength(2),Validators.maxLength(100),entityNameValidator()]],
  productType: [null,[Validators.required]],
  categoryId: [null,[Validators.required]],
  groupId: [null,[Validators.required]],
  vat: [0,[Validators.required]],
  selectiveVat: [0],
  isScaleItem: [true],
  vatCode: [''],
  taxExemptionReasonCode: [null,[Validators.required]],
  taxExemptionReason: ['',[Validators.required]],

  productCards: this._fb.array([
    this.createProductCard()
  ])
});

createProductCard() {
  return this._fb.group({
    id: [null],
    unitOfMeasureId: [null],
    isBaseUnit: [true],
    smallerUnitId: [null],
    conversionFactor: [0],
    purchasePrice: [0],
    retailPrice: [0],
    wholesalePrice: [0],
    barcode1: [''],
    barcode2: [''],
    isDefaultSellingUnit: [false]
  });
}

newProductCardForm: any = this.createProductCard();

// !!!!!!!!!!! Methods

ngOnInit() {
  this.productForm.get('nameAr')?.valueChanges.subscribe((value) => {
    this.productForm.patchValue({
      nameEn: value
    },{emitEvent:false})
  })  

    this.initVatLogic();
}

initVatLogic(): void {
  this.productForm.get('taxExemptionReasonCode')?.valueChanges.subscribe(code => {
    
    const reasonControl = this.productForm.get('taxExemptionReason');

    if (code === 'E' || code === 'O') {
      
      reasonControl?.enable();

   
      if (!reasonControl?.value) {
        reasonControl?.setValue('VATEX-SA-29'); // الخدمات المالية
      }

    } else {
      // 🔒 disable + reset
      reasonControl?.setValue('VATEX-SA-29'); // default
      reasonControl?.disable();
    }

  });
}
get productCards(): FormArray {
  return this.productForm.get('productCards') as FormArray;
}

// addProductCard() {
//   this.productCards.push(this.createProductCard());
// }

units:any=[]
addProductCard() {
  if (this.newProductCardForm.invalid) return;

  this.productCards.push(
    this._fb.group(this.newProductCardForm.value)
  );

  this.newProductCardForm.reset({
    isBaseUnit: true,
    conversionFactor: 0,
    purchasePrice: 0,
    retailPrice: 0,
    wholesalePrice: 0,
    isDefaultSellingUnit: false
  });
}
removeProductCard(index: number) {
  this.productCards.removeAt(index);
}

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


get buttonLabel(): string {
  return this.isEditMode ? this.buttonConfig.edit.label : this.buttonConfig.create.label;
}

get buttonClass(): string {
  return this.isEditMode ? this.buttonConfig.edit.class : this.buttonConfig.create.class;
}
}
