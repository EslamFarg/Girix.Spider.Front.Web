import { Component, DestroyRef, inject, ViewChild } from '@angular/core';
import { PageHeader } from '../../../../../../shared/ui/page-header/page-header';
import { DatePicker } from 'primeng/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FormError } from '../../../../../../shared/ui/form-error/form-error';
import { invoiceType, PaymentMethod } from '../../../../../../shared/Enums/invoice.enum';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { LookupFacade } from '../../../../../../shared/base/LookupFacade';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Suppliers } from '../../../customers-and-supplier/suppliers/services/suppliers';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import IntlTelInput from '@intl-tel-input/angular';
import { egyptSaudiPhoneValidator } from '../../../../../../shared/validations/phoneNumber';
import { MessageService } from 'primeng/api';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { ProductCardService } from '../../../products/product-card/services/product-card';
import { DecimalPipe, NgClass, NgIf } from '@angular/common';
import { InventoriesServices } from '../../../products/inventories/services/inventories-services';
import { userNameValidation } from '../../../../../../shared/validations/user-name';
import { EmailValidation } from '../../../../../../shared/validations/email';
import { customerType } from '../../../../../../shared/Enums/customer-type.enum';
import { CustSuppType } from '../../../../../../shared/Enums/custSupp-type.enum';
import { SharedConfirmDialog } from '../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { Purchase } from '../services/purchase';

@Component({
  selector: 'app-add-purchase-invoice',
  imports: [
    PageHeader,
    DatePicker,
    NgSelectComponent,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DecimalPipe,
    ReactiveFormsModule,
    FormError,
    onlyNumberDirective,
    IntlTelInput,
    AutoCompleteModule,
    NgClass,
    SharedConfirmDialog,
    
  ],
  templateUrl: './add-purchase-invoice.html',
  styleUrl: './add-purchase-invoice.scss',
})
export class AddPurchaseInvoice extends FormComponentBase {
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _lookup = inject(LookupFacade);
  _destroyRef = inject(DestroyRef);
  _supplierService = inject(Suppliers);
  _messageService = inject(MessageService);
  _productServices = inject(ProductCardService);
  _inventoriesServices = inject(InventoriesServices);
  _purchaseServices = inject(Purchase);
  
  // _supplierServices=inject(Suppliers)
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('autoComplete') autoComplete!: AutoComplete;

  purchaseForm: FormGroup = this._fb.group({
    invoiceNumber: [{ value: 0, disabled: true }, Validators.required],
    // reference: [null, Validators.required],
    supplierId: [null, Validators.required],
    purchasesDate: [new Date(), Validators.required],
    notes: [''],
    RefNum: [''],
    orderPymentType: [null, Validators.required],
    paymentMethod: [null, Validators.required],

    supplierPhone: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(20),
        egyptSaudiPhoneValidator,
      ],
    ],
    taxNumber: [null, [Validators.required, Validators.minLength(9), Validators.maxLength(15)]],
    net: [0],
    expenses: ['', [Validators.required]],
    branchId: [null, Validators.required],
    paidCash: [null, [Validators.required]],
    paidCashAccountId: [null, [Validators.required]],
    networkPaid: [null, [Validators.required]],
    networkPaidAccountId: [null],
    purchaseDetails: this._fb.array([]) as any,
  });

  searchControl = new FormControl('', Validators.required);

  date2: Date | undefined;

  showSearchBox = false;
  loadUtils = () => import('intl-tel-input/utils');
  @ViewChild('phoneInput') phoneInput: any;

  explorerBtn = {
    label: 'مستكشف فاتوره شراء',
    link: '/purchase-invoice/explorer',
  };

  items = [];

  invoiceType = [
    {
      name: 'اجل',
      id: invoiceType.Cash,
    },
    {
      name: 'نقدي',
      id: invoiceType.Credit,
    },
  ];

  paymentMethod = [
    {
      name: 'كاش',
      id: PaymentMethod.Cash,
    },
    {
      name: 'شبكة',
      id: PaymentMethod.NetworkPayment,
    },
    {
      name: 'تحويل بنكي',
      id: PaymentMethod.BankTransfer,
    },
  ];

  visible: boolean = false;

  Company: any;

  showDialog() {
    this.visible = true;
  }
getDataInventories:any[]=[]
warehouseData: any[] = [
  {name:"EEE",id:1},
  {name:"EEE",id:2},
];
  // invoiceTypeEnum: invoiceType = invoiceType;
  // !!!!!!!!!!!!!!! Methods
  ngOnInit() {
    this._lookup.loadSuppliers();
    // this._lookup.loadInventories();
    this.getAllInventories();
    
    this.listenSupplierChange();
    this.loadNameEnInSupplier();
    this.loadPhoneNumber();
    this.listenPaymentChanges();
    this.getAllAccountsCash();
    this.getAllNetAccounts();
  
    this.refreshActions();
  }



  getAllInventories(){
         this._inventoriesServices.getAllWithoutPagination().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res:any)=>{
          this.getDataInventories=res.data.rows
         
        })
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1 PaymentMethod Invoice!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
  // ** properties
  cashAccounts: any[] = [];
  NetAccounts: any[] = [];
  getAllAccountsCash() {
    this._purchaseServices
      .getAllAccountsCash()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.cashAccounts = res.data;
        
      });
  }
  getAllNetAccounts() {
    this._purchaseServices
      .getAllNetAccounts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.NetAccounts = res.data;
       
      });
  }

  private listenPaymentChanges(): void {
    this.purchaseForm
      .get('orderPymentType')!
      .valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.updatePaymentValidators();
      });

    this.purchaseForm
      .get('paymentMethod')!
      .valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this.updatePaymentValidators();
      });

    // تشغيلها أول مرة عند فتح الصفحة
    this.updatePaymentValidators();
  }

  private updatePaymentValidators(): void {
    const invoiceTypeValidators = this.purchaseForm.get('orderPymentType')?.value;
    const paymentMethodValue = this.purchaseForm.get('paymentMethod')?.value;

    const paidCash = this.purchaseForm.get('paidCash');
    const paidCashAccount = this.purchaseForm.get('paidCashAccountId');

    const networkPaid = this.purchaseForm.get('networkPaid');
    const networkAccount = this.purchaseForm.get('networkPaidAccountId');

    // إزالة جميع الـ Validators
    [paidCash, paidCashAccount, networkPaid, networkAccount].forEach((control) => {
      control?.clearValidators();
      control?.updateValueAndValidity({ emitEvent: false });
    });


    // لو كاش
    if (paymentMethodValue === PaymentMethod.Cash) {
      paidCash?.setValidators([Validators.required]);
      paidCashAccount?.setValidators([Validators.required]);
    }

    // لو شبكة
    if (paymentMethodValue === PaymentMethod.NetworkPayment) {
      networkPaid?.setValidators([Validators.required]);
      networkAccount?.setValidators([Validators.required]);
    }

    paidCash?.updateValueAndValidity({ emitEvent: false });
    paidCashAccount?.updateValueAndValidity({ emitEvent: false });

    networkPaid?.updateValueAndValidity({ emitEvent: false });
    networkAccount?.updateValueAndValidity({ emitEvent: false });
  }

  private listenSupplierChange(): void {
    this.purchaseForm
      .get('supplierId')!
      .valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((id) => {
        if (!id) {
          // this.resetSupplier();
          return;
        }

        this.loadSupplier(id);
      });
  }
  loadSupplier(id: any) {
    if (!id) {
      return;
    }
    this._supplierService
      .getById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          const supplier = res.data;
          this.purchaseForm.patchValue({
            // supplierName: supplier.name,
            supplierPhone: supplier.phoneNumber,
            taxNumber: supplier.taxNumber,
          });
        },
      });
  }

  onCountryChange() {
    const iti = this.phoneInput?.iti;

    if (!iti) return;

    const country = iti.getSelectedCountryData();

    const dialCode = country?.dialCode;

  }



  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!! Table Products !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  get purchaseDetails(): any {
    return this.purchaseForm.get('purchaseDetails') as FormArray;
  }

  addPurchaseDetail(): void {
    this.purchaseDetails.push(this.createPurchaseDetail());
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ProductInvoice
  createPurchaseDetail(product?: any): FormGroup {
    return this._fb.group({
      productCartId: [product?.id || null, Validators.required],
      productCode: [product?.code || ''],
      productName: [product?.name || ''],
      unitName: [product?.unitName || 'قطعة'], // القيمة الافتراضية للوحدة
      warehouseId: [this.purchaseForm.get('branchId')?.value || null, Validators.required], // ربط تلقائي بمخزن الفرع إن وجد

      quantity: [1, [Validators.required, Validators.min(1)]],
      purchasesPrice: [product?.price || 0, [Validators.required, Validators.min(0.01)]],
      total: [0], // الكمية * السعر
      vat: [0], // قيمة الضريبة للسطر
      vatRate: [product?.vatRate || 15], // نسبة ضريبة الصنف مثلاً 15%

      disCountPercentage: [0, [Validators.min(0), Validators.max(100)]],
      discountAmount: [0, Validators.min(0)],
      vatDiscount: [0],
      totalDiscount: [0],
      net: [0], // الصافي النهائي للسطر
    });
  }

  unitData: any[] = [];
  // مصفوفة لتخزين وحدات الصنف المختار حالياً في سطر الإضافة
  currentProductUnits: any[] = [];


  itemAddingForm: FormGroup = this._fb.group({
    productCartId: [null, Validators.required],
    productCode: [''],
    productName: [''],
    warehouseId: [null, Validators.required],
    unitId: [null, Validators.required], // معتمد على الصنف المختار
    unitName: [''],
    qty: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    discountRate: [0],
    discountAmount: [0],
    taxRate: [15], // نسبة الضريبة الافتراضية مثلاً 15%
    tax: [0],
    total: [0],
  });


    search(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.items = [];
      return;
    }

    const pageIndex = 0;
    const PageSize = 0;

    this._purchaseServices
      .searchByProductName(pageIndex, PageSize, query)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.items = res.data.rows.map((item: any) => ({
          label: item.name,
          value: item.id,
        }));
    
        setTimeout(() => {
          this.autoComplete.show();
        });
      });
  }

  onSelectProduct(event: any) {
  const productId = event.value?.value ? event.value.value : event.value;
  
  if (!productId) return;

  // جلب بيانات وحدات الصنف وتحديث الفورم
  this._purchaseServices.getProductCartByProductId(productId)
    .pipe(takeUntilDestroyed(this._destroyRef))
    .subscribe((res: any) => {
      this.unitData = res.data; // مصفوفة الوحدات القادمة من السيرفر

      if (this.unitData && this.unitData.length > 0) {
        const firstUnit = this.unitData[0];
        
        // تحديث حقول سطر الإضافة بالوحدة الأولى وسعرها تلقائياً
        this.itemAddingForm.patchValue({
          productCartId: productId,
          productCode: firstUnit.productCode || '', // تأكد من مطابقة المسميات مع الـ API
          productName: event.value?.label || firstUnit.productName,
          unitId: firstUnit.id,
          unitName: firstUnit.name,
          price: firstUnit.price || 0, // السعر الافتراضي لهذه الوحدة
          qty: 1,
          discountRate: 0,
          discountAmount: 0
        }, { emitEvent: false });

        // إعادة حساب الإجماليات للسطر
        // this.calculateAddingRowTotals();
      }
    });
}


  

  loadUnitData(productId: number) {
      this._purchaseServices.getProductCartByProductId(productId).subscribe((res: any) => {
      // const = res.data;
      this.unitData = res.data;

      });

  }



   onUnitChange(selectedUnitId: any) {
    
  }

  searchByProductCode(e: any) {
    const code = e.target.value?.trim();
    if (!code){
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الكود غير موجود',
      })
      return
    } ;


    this._purchaseServices.searchByCode(code).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      if (res?.data) {
      const product = res?.data?.rows?.length > 0 ? res.data.rows[0] : res?.data;
      if (product && product.id) {
        this.loadProductToAddingRow(product);
        e.target.value = '';
      }
      } else {
        this._messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الكود غير موجود' });
      }
    })

  }

  loadProductToAddingRow(res: any) {
  const product = res?.data || res;
  if (!product || !product.id) return;

  const units = product.productCart || [];
  const defaultUnit = units.find((u: any) => u.selected === true) || units[0];

  // إذا لم يكن للصنف أي وحدات، نضع قيم صفرية حماية للكود
  const unitId = defaultUnit ? defaultUnit.id : null;
  const unitName = defaultUnit ? defaultUnit.fromUnitName : '';
  const price = defaultUnit ? (defaultUnit.purchasePrice || 0) : 0;
  const vatRate = product.vat || 0; // نسبة الضريبة مثلاً 15

  const totalBeforeTax = +(1 * price).toFixed(2);

const taxAmount = +(
  totalBeforeTax * (vatRate / 100)
).toFixed(2);

const netTotal = +(
  totalBeforeTax + taxAmount
).toFixed(2);

  // 4. بناء الـ FormGroup المطابق تماماً للـ FormArray بالأسفل
  const newRowGroup = this._fb.group({
    productCartId: [product.id, Validators.required],
    productCode: [product.code || ''], // لو الباكيند بيرجع كود
    productName: [product.productName || ''],
    warehouseId: [this.purchaseForm.get('branchId')?.value || null, Validators.required], 
    warehouseName: [''], // سيتم عرضه بناءً على اختيار المخزن لاحقاً
    unitId: [unitId, Validators.required],
    unitName: [unitName],
    quantity: [1, [Validators.required, Validators.min(1)]],
    purchasesPrice: [price, [Validators.required, Validators.min(0.01)]],
    disCountPercentage: [0],
    discountAmount: [0],
    vat: [taxAmount], // قيمة الضريبة المحسوبة للسطر
    net: [netTotal], // الصافي النهائي الكلي للسطر
  });


  newRowGroup.valueChanges.subscribe(() => {
    this.calculateRowTotals(newRowGroup, vatRate);
  });


  this.purchaseDetails.push(newRowGroup);

  this.calculateRowTotals(newRowGroup, vatRate);

  // تصفير حقل البحث العلوي
  this.searchControl.reset(null, { emitEvent: false });

  // 8. تصفير حقول البحث للاستعداد للصنف القادم
  this.searchControl.reset(null, { emitEvent: false });
}

 calculateRowTotals(row: FormGroup, vatRate: number) {
  const qty = Number(row.get('quantity')?.value) || 0;
  const price = Number(row.get('purchasesPrice')?.value) || 0;
  let discountPercent = Number(row.get('disCountPercentage')?.value) || 0;
  let discountAmount = Number(row.get('discountAmount')?.value) || 0;

  const totalBeforeDiscount = qty * price;

  if (row.get('disCountPercentage')?.dirty) {
    discountAmount = totalBeforeDiscount * (discountPercent / 100);
    row.get('discountAmount')?.setValue(discountAmount, { emitEvent: false });
  } 
  // إذا تم تغيير قيمة الخصم مباشرة، احسب النسبة المئوية لها
  else if (row.get('discountAmount')?.dirty) {
    discountPercent = totalBeforeDiscount > 0 ? (discountAmount / totalBeforeDiscount) * 100 : 0;
    row.get('disCountPercentage')?.setValue(discountPercent, { emitEvent: false });
  }


  const subTotal = +(totalBeforeDiscount - discountAmount).toFixed(2);

// حساب قيمة الضريبة
const vatAmount = +(subTotal * (vatRate / 100)).toFixed(2);

const netTotal = +(subTotal + vatAmount).toFixed(2);

  row.patchValue({
    vat: vatAmount,
    net: netTotal
  }, { emitEvent: false });

  // تحديث الإجماليات الكلية للفاتورة بالأسفل
  this.calculateInvoiceTotals();
}

calculateInvoiceTotals() {
  let totalQty = 0;
  let totalDiscount = 0;
  let totalVat = 0;
  let netInvoice = 0;

  this.purchaseDetails.controls.forEach((control:any) => {
    totalQty += Number(control.get('quantity')?.value) || 0;
    totalDiscount += Number(control.get('discountAmount')?.value) || 0;
    totalVat += Number(control.get('vat')?.value) || 0;
    netInvoice += Number(control.get('net')?.value) || 0;
  });

  // إسناد القيم لمتغيرات الـ tfoot المعروضة لديك في الـ HTML
  this.totalQuantities = totalQty;
  this.totalDiscounts = totalDiscount;
  this.totalVat = totalVat;
  this.invoiceNetTotal = netInvoice;
}

  // ترحيل البيانات من السطر العلوي إلى جدول الـ FormArray بالأسفل
  addToTable() {
    if (this.itemAddingForm.invalid) {
      this.itemAddingForm.markAllAsTouched();
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'يرجى اختيار الصنف والمخزن والوحدة أولاً',
      });
      return;
    }

    const rawData = this.itemAddingForm.getRawValue();

    // بناء FormGroup للسطر الجديد في الـ FormArray الرئيسي ليرسل للسيرفر
    const itemGroup = this._fb.group({
      productCartId: [rawData.productCartId, Validators.required],
      productCode: [rawData.productCode],
      productName: [rawData.productName],
      warehouseId: [rawData.warehouseId, Validators.required],
      // هنا نجلب اسم المخزن من الـ LookupFacade للعرض بالجدول بالأسفل
      warehouseName: [
        this._lookup.inventories().find((i) => i.id === rawData.warehouseId)?.name || '',
      ],
      unitId: [rawData.unitId, Validators.required],
      unitName: [rawData.unitName],
      quantity: [rawData.qty, [Validators.required, Validators.min(1)]],
      purchasesPrice: [rawData.price, Validators.required],
      disCountPercentage: [rawData.discountRate],
      discountAmount: [rawData.discountAmount],
      vat: [rawData.tax],
      net: [rawData.total],
    });

    // إضافة للـ FormArray
    this.purchaseDetails.push(itemGroup);

    // تحديث إجماليات الفاتورة الكلية بالأسفل
    this.calculateInvoiceTotals();

    // تصفير سطر الإضافة بالكامل عدا المخزن (لتسهيل الإدخال المتكرر لنفس المخزن)
    const currentWarehouse = rawData.warehouseId;
    this.itemAddingForm.reset({
      qty: 1,
      price: 0,
      discountRate: 0,
      discountAmount: 0,
      warehouseId: currentWarehouse,
      taxRate: 15,
    });
    this.searchControl.reset();
    this.currentProductUnits = [];
  }

  // دالة حساب إجمالي الفاتورة التراكمي السفلي
  totalQuantities = 0;
  totalDiscounts = 0;
  totalVat = 0;
  invoiceNetTotal = 0;


  removePurchaseDetail(index: number) {
    this.purchaseDetails.removeAt(index);
    this.calculateInvoiceTotals();
  }
  // !!!!! AutoComplete

  // ******* search

  getProductByCode(code: number) {
    const payload = buildSearchPayload(code.toString(), 1, SearchableColumnEnum.Code);

    this._productServices.search(payload).subscribe((res: any) => {
      if (!res?.data?.rows || res.data.rows.length === 0) {
        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: `لا يوجد صنف بالكود ${code}`,
        });
        this.reset();
        return;
      }
      if (res.data.rows.length) {
        const id = res.data.rows[0].id;

        this._productServices.getById(id).subscribe((result: any) => {
          // نفس الكود الموجود داخل onSelectProduct()
          this.loadProduct(result.data);
        });
      }
    });
  }

  loadProduct(data: any) {
    this.idUpdate = data.id;

    // this.productCards.clear();

    data.productCardDetails.forEach((card: any) => {
      // const form = this.createProductCard();
      // form.patchValue(card);
      // this.productCards.push(form);
    });


    this.changeButtonState(data.id, true);
  }

  onEnter(event: any) {
    // if (this.searchControl.invalid) {
    //   this._messageService.add({
    //     severity: 'error',
    //     summary: 'خطأ',
    //     detail: `يجب ادخال قيمه بحث ${this.selectedSearch}`,
    //   });
    //   return;
    // }
  }

  pageSize = 10;
  SearchValEnum = SearchableColumnEnum.Name;

  save() {
    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }
    console.log('Save action triggered');
  }

  reset() {
    console.log('Reset action triggered');
  }

  delete() {
    console.log('Delete action triggered');
  }

  print() {
    console.log('Print action triggered');
  }
  // !!!!!!!!!! Supplier
  commercialRegister = [
    {
      id: 1,
      name: 'رقم السجل التجارى',
    },
    {
      id: 2,
      name: 'رخصة وزارة الشؤون البلدية والقروية والإسكان',
    },
    {
      id: 3,
      name: 'رخصة وزارة الموارد البشرية والتنمية الاجتماعية',
    },
    {
      id: 4,
      name: 'رخصة وزارة الاستثمار',
    },
    {
      id: 5,
      name: 'معرف آخر',
    },
  ];

  company = customerType.Company;
  supplierEnum = CustSuppType.Supplier;

  supplierForm: FormGroup = this._fb.group({
    customerCode: [{ value: '', disabled: true }],
    customerType: [this.company, Validators.required],
    nameAr: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        userNameValidation(),
      ],
    ],
    nameEn: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        userNameValidation(),
      ],
    ],
    phoneNumber: ['', [Validators.required, egyptSaudiPhoneValidator]],
    phoneCountryCode: ['+20', Validators.required],
    email: ['', [Validators.required, EmailValidation]],
    creditLimit: [null, [Validators.required, Validators.maxLength(12)]],
    creditWarningLimit: [null, [Validators.required, Validators.maxLength(12)]],
    idTypeId: [null, [Validators.required]],
    custSuppType: [this.supplierEnum],
    idNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(14)]],
    // taxNumber: [''],
    taxNumber: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(15)]],
    notes: ['', [Validators.maxLength(500)]],
    address: this._fb.group({
      country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      buildingNumber: ['', [Validators.required, Validators.maxLength(10)]],
      postalCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
    }),
  });

  isEditModeSupplier = false;
  idSupplier: any;
  showDeleteDialogSupplier = false;
  loadNameEnInSupplier() {
    this.supplierForm
      .get('nameAr')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((value) => {
        this.supplierForm.patchValue(
          {
            nameEn: value,
          },
          { emitEvent: false },
        );
      });
  }

  loadPhoneNumber() {
    this.supplierForm
      .get('phoneNumber')
      ?.valueChanges.pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((phone: string) => {
        if (!phone) return;

        if (/^(010|011|012|015)/.test(phone)) {
          this.supplierForm.patchValue(
            {
              phoneCountryCode: '+20',
            },
            { emitEvent: false },
          );

          this.phoneInput?.iti?.setCountry('eg');
        }

        if (/^05/.test(phone)) {
          this.supplierForm.patchValue(
            {
              phoneCountryCode: '+966',
            },
            { emitEvent: false },
          );

          this.phoneInput?.iti?.setCountry('sa');
        }
      });
  }

  get addressForm(): FormGroup {
    return this.supplierForm.get('address') as FormGroup;
  }

  onCountryChange2() {
    const iti = this.phoneInput?.iti;

    if (!iti) return;

    const country = iti.getSelectedCountryData();

    const dialCode = country?.dialCode;

    // this.purchaseOrderForm.patchValue({
    //   phoneCountryCode: dialCode ? '+' + dialCode : '',
    // });
  }

  addSupplier() {
  
    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      return;
    }
    const raw = this.supplierForm.getRawValue();

    let payload: any;

    if (raw.customerType === 1) {
      payload = {
        ...raw,
        address: null,
      };
    } else {
      payload = {
        ...raw,
        simpleAddress: null,
      };
    }

    if (this.isEditModeSupplier == false) {
      this._supplierService
        .create(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم الحفظ بنجاح',
            });

            // this.updateSimpleAddressValidation(this.supplierForm.get('customerType')?.value);

            // this.changeButtonState(res.data.id,true);
            this.idSupplier = res.data.id;
            this.isEditModeSupplier = true;
            this.supplierForm.get('customerCode')?.setValue(res.data.code);
          },
        });
    } else {
      // Update

      this._supplierService
        .update(payload, this.idSupplier)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'تم التحديث بنجاح',
            });
            // this.changeButtonState(res.data.id,true);
          },
        });
    }
  }

  resetSupplier() {
    // this.supplierForm.reset();

    this.supplierForm.reset({
      customerCode: 0,
      custSuppType: this.supplierEnum,
      customerType: this.Company,
      // phoneCountryCode: '+966',
    });
    this.idSupplier = 0;
    this.isEditModeSupplier = false;
    this.refreshActions();
  }

  deleteDialogSupplier() {
    this._supplierService
      .delete(this.idSupplier)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialogSupplier = false;
          this.resetSupplier();
        },
      });
  }

  deleteSupplier() {
    this.showDeleteDialogSupplier = true;
  }

  printSupplier() {
    this.supplierForm.reset();
  }

  value: any;
  selectedSearchType: 'mobile' | 'name' | 'code' = 'name';
  selectedSearchSupplier: string = 'الأسم';

  selectFilterSearchSupplier(type: 'mobile' | 'name' | 'code') {
    this.selectedSearchType = type;
    if (type == 'name') {
      this.selectedSearchSupplier = 'الأسم';
      this.SearchValEnum = SearchableColumnEnum.Name;
    }

    // else if (type == 'mobile') {
    //   this.selectedSearchSupplier = 'رقم الجوال';
    //   // this.SearchValEnum=SearchableColumnEnum.Phone

    // }
    else if (type == 'code') {
      this.selectedSearchSupplier = 'الكود';
      this.SearchValEnum = SearchableColumnEnum.Code;
    }
    this.showSearchBox = false;
  }

  onEnterSupplier(event: any) {
    if (this.searchControl.invalid) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: `يجب ادخال قيمه بحث ${this.selectedSearchSupplier}`,
      });
      return;
    }
    // نفذ البحث هنا
  }

  searchSupplier(event: AutoCompleteCompleteEvent) {
    
    const query = (event.query ?? '').trim();
    if (!query) {
      this.items = [];
      return;
    }

    const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);

    this._supplierService
      .search(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.items = res.data.rows.map((item: any) => ({
            label: item.name,
            value: item.id,
          }));
          setTimeout(() => {
            this.autoComplete.show();
          });
        },
      });
  }

  // dasdasd
  onSelectSupplier(event: any) {
    const delegateId = event.value.value;

    this._supplierService
      .getById(delegateId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res) => {
     

        this.supplierForm.patchValue({
          ...res.data,
          nameAr: res.data.name,
          nameEn: res.data.name,
          idTypeId: res.data.idType,
        });
        this.addressForm.patchValue({
          ...res.data,
        });
        // this.changeButtonState(res.data.id,true);
        this.isEditModeSupplier = true;
        this.idSupplier = res.data.id;
        // this..nativeElement.value = res.data.id;
        this.supplierForm.get('customerCode')?.setValue(res.data.code);

        const iti = this.phoneInput?.iti;

        if (iti) {
          switch (res.data.phoneCountryCode) {
            case '+20':
              iti.setCountry('eg');
              break;

            case '+966':
              iti.setCountry('sa');
              break;

            case '+971':
              iti.setCountry('ae');
              break;
          }
        }
        this.searchControl.reset();
        this.items = [];
      });
  }
}
