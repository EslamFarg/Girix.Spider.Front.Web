import { Component, DestroyRef, ElementRef, HostListener, inject, signal, ViewChild } from '@angular/core';
import { Dialog } from "primeng/dialog";
import { DatePickerModule } from "primeng/datepicker";
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { MessageService } from 'primeng/api';
import { QrcodeServices } from '../services/qrcode-services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { NgxBarcode6 } from 'ngx-barcode6';
import { PrintPreview } from '../../../../../../shared/components/print-preview/print-preview';
import { NgClass } from '@angular/common';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';

interface QrcodeUnitRow {
  id: number;
  name: string;
  bareCode1: string;
  bareCode2: string;
}

@Component({
  selector: 'app-add-qrcode-printer',
  imports: [Dialog, PrintPreview, NgxBarcode6, DatePickerModule, PageHeader, QRCodeComponent, ReactiveFormsModule, FormError, AutoComplete, NgClass],
  templateUrl: './add-qrcode-printer.html',
  styleUrl: './add-qrcode-printer.scss',
})
export class AddQrcodePrinter {

  
   // !!!!!!!!!!!!!!!!! Services
   _messageService = inject(MessageService);
   _qrcodeService = inject(QrcodeServices);
   destroyRef:DestroyRef = inject(DestroyRef);
   _fb:FormBuilder=inject(FormBuilder);
   formQrCode=this._fb.group({
      qrContent: [''],
      qrPixelsPerModule: [0],
      manufactureDate: [new Date(),[Validators.required]],
      expiryDate: [new Date(new Date().setFullYear(new Date().getFullYear() + 1)),[Validators.required]],
      productName: ['']
  });


  // !!!!!!!!!!!!!!!!!!! Properties

  @ViewChild('qrArea')
  qrArea!: ElementRef;


  @ViewChild('barcodeArea') barcodeArea!: ElementRef;
  @ViewChild('autoComplete') autoComplete!: AutoComplete;

  showSearchBox = false;
  selectedSearch = 'كود الصنف';
  selectedSearchType: 'code' | 'barcode' | 'name' = 'code';
  searchControl = new FormControl('');
  searchItems: { label: string; value: string | number }[] = [];

  date2: Date | undefined;
 actions = [
  { label: 'حفظ', type: 'primary', action: 'save' },
  { label: 'جديد', action: 'reset' },
  { label: 'حذف', action: 'delete' },
  { label: 'طباعه', action: 'print' }
];

isCreatingQrCode: boolean = false;

   visible: boolean = false;

explorerBtn={
  label:'طباعة لأكثر من الباركود ',
  link:'/qrcode-printer/explorer'
}

qrValue:any = '';



  barcode = '';
units: QrcodeUnitRow[] = [];

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

@HostListener('document:click', ['$event'])
onDocumentClick(event: Event): void {
  const targetElement = (event.target as HTMLElement)?.closest('.search_input') as HTMLElement;
  if (!targetElement) {
    this.showSearchBox = false;
  }
}

selectFilterSearch(type: 'code' | 'barcode' | 'name'): void {
  this.selectedSearchType = type;

  switch (type) {
    case 'code':
      this.selectedSearch = 'كود الصنف';
      break;
    case 'barcode':
      this.selectedSearch = 'الباركود';
      break;
    case 'name':
      this.selectedSearch = 'اسم الصنف';
      break;
  }

  this.showSearchBox = false;
  this.searchItems = [];
  this.searchControl.reset();
}

searchProductsByName(event: AutoCompleteCompleteEvent): void {
  const query = (event.query ?? '').trim();
  if (!query) {
    this.searchItems = [];
    return;
  }

  this._qrcodeService
    .searchByProductName(0, 0, query)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res: any) => {
      this.searchItems = (res?.data?.rows ?? []).map((item: { id: number; name: string }) => ({
        label: item.name,
        value: item.id,
      }));

      setTimeout(() => {
        this.autoComplete?.show();
      });
    });
}

onSearchEnter(event: Event): void {
  event.preventDefault();
  this.runSearch(this.searchControl.value?.trim() ?? '');
}

runSearch(value: string): void {
  if (this.selectedSearchType === 'name') {
    return;
  }

  if (!value) {
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: `يجب ادخال ${this.selectedSearch}`,
    });
    return;
  }

  this.searchByCodeOrBarcode(value);
}

onSelectProductByName(event: { value: { label: string; value: number } | number }): void {
  const productId = typeof event.value === 'object' ? event.value?.value : event.value;
  const productName = typeof event.value === 'object' ? event.value?.label : '';

  console.log(event);
  if (!productId) {
    return;
  }

  this._qrcodeService
    .getProductCartByProductId(productId)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res: any) => {
      const productCart = res?.data ?? [];

      console.log(productCart);

      if (productCart.length === 0) {
        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: 'لم يتم العثور على وحدات للصنف',
        });
        return;
      }

      this.loadProductData(productName, productCart);
      this.searchControl.reset();
      this.searchItems = [];
    });
}

// !!!!!!!!!!!!!!!!!!! QR Code Value And Bar Code


searchByCodeOrBarcode(value: string): void {
  if (!value || value.trim() === '') {
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: `يجب ادخال ${this.selectedSearch}`,
    });
    return;
  }

  this._qrcodeService
    .searchByCodeOrBarcode(value.trim())
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res: any) => {
      if (!res?.data?.productCart?.length) {
        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: 'لم يتم العثور على الصنف',
        });
        this.units = [];
        this.formQrCode.patchValue({ productName: '' });
        return;
      }

      this.loadProductData(res.data.productName, res.data.productCart);
      this.searchControl.reset();
      this.isCreatingQrCode = false;
    });
}

loadProductData(productName: string, productCart: any): void {
  this.formQrCode.patchValue({ productName });
  this.isCreatingQrCode = false;

  // this.units = productCart.map((item: any) => ({
  //   name: item.fromUnitName || item.name || '',
  //   id: item.id,
  //   bareCode1: item.bareCode1 ?? '',
  //   bareCode2: item.bareCode2 ?? '',
  // }));
  const units = Array.isArray(productCart)
  ? productCart
  : productCart?.productCart ?? [];

this.units = units.map((item: any) => ({
  name: item.fromUnitName || item.name || '',
  id: item.id,
  bareCode1: item.bareCode1 ?? '',
  bareCode2: item.bareCode2 ?? '',
}));
}



// !!!! Barcode 
  // قيمة الباركود
  barcodeValue = '';

  // نوع الباركود
  selectedBarcodeObj = signal({
    value: 'CODE128',
    example: ''
  });

  // إعدادات الباركود
  selectedWidth = signal(2);
  selectedHeight = signal(80);
  selectedFontSize = signal(18);

  createBarcode(res: any) {

 
    

    this.barcodeValue = res.data.qrContent;

    this.selectedBarcodeObj.set({
      value: 'CODE128',
      example: this.barcodeValue
    });
  }


printUnitQrCode(unit: QrcodeUnitRow): void {
  if (this.formQrCode.get('manufactureDate')?.invalid || this.formQrCode.get('expiryDate')?.invalid) {
    this.formQrCode.markAllAsTouched();
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: 'يجب اختيار تاريخ الانتاج وتاريخ الانتهاء',
    });
    return;
  }

  const payload = {
    productCardId: unit.id,
    qrContent: this.formQrCode.value.qrContent,
    qrPixelsPerModule: this.formQrCode.value.qrPixelsPerModule,
    manufactureDate: this.formQrCode.value.manufactureDate,
    expiryDate: this.formQrCode.value.expiryDate,
  };

  if (this.isExpired()) {
    this._messageService.add({
      severity: 'error',
      summary: 'خطأ',
      detail: 'هذا المنتج منتهي الصلاحية'
    });
  
    this.isCreatingQrCode = false;
    return;
  }
  this._qrcodeService
    .generateQrCode(payload)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe((res: any) => {

      if (this.isExpired()) {

        this._messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'هذا المنتج منتهي الصلاحية'
        });
    
        this.isCreatingQrCode = false;
    
        return;
      }

      if (res.isSuccess) {
        this._messageService.add({
          severity: 'success',
          summary: 'تمت العملية بنجاح',
          detail: 'تم انشاء الباركود بنجاح',
        });
        this.isCreatingQrCode = true;
        this.qrValue = JSON.stringify({
          productName: res.data.productName,
          unitName: res.data.unitName,
          manufactureDate: res.data.manufactureDate.split('T')[0],
          expiryDate: res.data.expiryDate.split('T')[0],
      
        });

     
        this.createBarcode(res);
      } else {
        this._messageService.add({ severity: 'error', summary: 'خطأ', detail: res.message });
        this.isCreatingQrCode = false;
      }
    });
}


private isExpired(): boolean {

  const expiry = new Date(this.formQrCode.value.expiryDate!);
  const today = new Date();

  expiry.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  return expiry.getTime() < today.getTime();
}


    showDialog() {
        this.visible = true;
    }
}
