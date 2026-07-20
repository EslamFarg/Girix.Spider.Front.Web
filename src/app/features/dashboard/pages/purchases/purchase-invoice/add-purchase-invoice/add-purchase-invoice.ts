import { Component, DestroyRef, inject, OnDestroy, ViewChild } from '@angular/core';
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
import {
  AccountLookupItem,
  ApiResponse,
  PaginatedRows,
  CreatePurchasePayload,
  ProductSearchItem,
  ProductUnitItem,
  PurchaseDetailDto,
  PurchaseDetailResponse,
  PurchaseResponse,
  UpdatePurchasePayload,
} from '../models/purchase-invoice';
import { CalculationService, DiscountSource } from '../../../../../../shared/services/calculation-service';
import { ApplicationSettingsService } from '../../../../../../shared/services/application-settings-service';

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
export class AddPurchaseInvoice extends FormComponentBase implements OnDestroy {
  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _lookup = inject(LookupFacade);
  _destroyRef = inject(DestroyRef);
  _supplierService = inject(Suppliers);
  _messageService = inject(MessageService);
  _productServices = inject(ProductCardService);
  _inventoriesServices = inject(InventoriesServices);
  _purchaseServices = inject(Purchase);
  _calculationService = inject(CalculationService);
  _applicationSettingsService = inject(ApplicationSettingsService);

  private currentProductTaxRates = { vatRate: 0, selectiveTaxRate: 0 };

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
    branchId: [null],
    paidCash: [null, [Validators.required]],
    paidCashAccountId: [null, [Validators.required]],
    networkPaid: [null, [Validators.required]],
    networkPaidAccountId: [null],
    purchaseDetails: this._fb.array([]),
  });

  searchControl = new FormControl('', Validators.required);
  supplierSearchControl = new FormControl('', Validators.required);
  invoiceSearchControl = new FormControl('');

  date2: Date | undefined;

  showSearchBox = false;
  loadUtils = () => import('intl-tel-input/utils');
  @ViewChild('phoneInput') phoneInput: any;

  explorerBtn = {
    label: 'مستكشف فاتوره شراء',
    link: '/purchase-invoice/explorer',
  };

  items: ProductSearchItem[] = [];

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
getDataInventories: { id: number; name: string }[] = [];
  showDeleteDialog = false;
  printCount = 0;
  editCount = 0;
  // invoiceTypeEnum: invoiceType = invoiceType;
  // !!!!!!!!!!!!!!! Methods
  ngOnInit() {
    this.ensureApplicationSettings();
    this._lookup.loadSuppliers();
    this.getAllInventories();
    this.listenSupplierChange();
    this.loadNameEnInSupplier();
    this.loadPhoneNumber();
    this.listenPaymentChanges();
    this.getAllAccountsCash();
    this.getAllNetAccounts();
    this.listenAddingRowChanges();
    this.loadPurchase();
    this.getApplicationSettings();
    this.refreshActions();
  }

  loadPurchase(): void {
    const id = this._sharedStateService.selectedId$();
    if (!id) {
      return;
    }

    this._purchaseServices
      .getPurchaseById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.fillForm(res.data);
        },
      });
  }



  getAllInventories() {
    this._inventoriesServices
      .getAllWithoutPagination<ApiResponse<PaginatedRows<{ id: number; name: string }>>>()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res) => {
        this.getDataInventories = res.data.rows;
      });
  }

  private ensureApplicationSettings(): void {
    if (!this._applicationSettingsService.settingsSignal()) {
      this._applicationSettingsService.setSettings();
    }
  }

  private listenAddingRowChanges(): void {
    this.itemAddingForm.valueChanges
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.calculateAddingRowTotals());
  }


  // !!!!!!!  Settings
  getApplicationSettings(): void {
    // this._applicationSettingsService.getSettings().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
    //   this.applicationSettings = res.data;
    // });
    const settings = this._applicationSettingsService.settingsSignal() as any;
    console.log(settings);
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1 PaymentMethod Invoice!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1
  // ** properties
  cashAccounts: AccountLookupItem[] = [];
  NetAccounts: AccountLookupItem[] = [];
  getAllAccountsCash() {
    this._purchaseServices
      .getAllAccountsCash()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: ApiResponse<AccountLookupItem[]>) => {
        this.cashAccounts = res.data;
      });
  }
  getAllNetAccounts() {
    this._purchaseServices
      .getAllNetAccounts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: ApiResponse<AccountLookupItem[]>) => {
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
  get purchaseDetails(): FormArray {
    return this.purchaseForm.get('purchaseDetails') as FormArray;
  }

  addPurchaseDetail(): void {
    this.purchaseDetails.push(this.createPurchaseDetail());
  }

  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ProductInvoice
  createPurchaseDetail(product?: PurchaseDetailResponse): FormGroup {
    const vatRate = product
      ? this._calculationService.inferVatRate(
          product.vat ?? 0,
          product.quantity ?? 0,
          product.purchasesPrice ?? 0,
          product.discountAmount ?? 0,
        )
      : 0;

    const selectiveTaxRate = product
      ? this._calculationService.inferSelectiveTaxRate(
          product.vatDiscount ?? 0,
          product.quantity ?? 0,
          product.purchasesPrice ?? 0,
          product.discountAmount ?? 0,
        )
      : 0;

    const row = this._fb.group({
      productCartId: [product?.productCartId ?? null, Validators.required],
      productCode: [product?.productCode || ''],
      productName: [product?.productName || ''],
      unitName: [product?.unitName || ''],
      warehouseId: [product?.warehouseId ?? this.purchaseForm.get('branchId')?.value ?? null, [Validators.required]],
      warehouseName: [product?.warehouseName || ''],
      unitId: [product?.unitId ?? null],
      quantity: [product?.quantity ?? 1, [Validators.required, Validators.min(1)]],
      purchasesPrice: [product?.purchasesPrice ?? 0, [Validators.required, Validators.min(0.01)]],
      total: [product?.total ?? 0],
      vat: [product?.vat ?? 0],
      vatRate: [vatRate],
      selectiveTaxRate: [selectiveTaxRate],
      invoiceDiscountShare: [0],
      disCountPercentage: [product?.disCountPercentage ?? 0, [Validators.min(0), Validators.max(100)]],
      discountAmount: [product?.discountAmount ?? 0, Validators.min(0)],
      vatDiscount: [product?.vatDiscount ?? 0],
      totalDiscount: [product?.totalDiscount ?? 0],
      net: [product?.net ?? 0],
    });

    this.attachRowCalculations(row);
    return row;
  }

  unitData: ProductUnitItem[] = [];
  // مصفوفة لتخزين وحدات الصنف المختار حالياً في سطر الإضافة
  currentProductUnits: ProductUnitItem[] = [];


  itemAddingForm: FormGroup = this._fb.group({
    productCartId: [null, Validators.required],
    productCode: [''],
    productName: [''],
    warehouseId: [null, Validators.required],
    unitId: [null, Validators.required], // معتمد على الصنف المختار
    unitName: [''],
    qty: [1, [Validators.required, Validators.min(1)]],
    price: [0, [Validators.required]],
    discountRate: [0],
    discountAmount: [0],
    taxRate: [0],
    selectiveTaxRate: [0],
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
      .subscribe((res: ApiResponse<PaginatedRows<{ id: number; name: string }>>) => {
        this.items = res.data.rows.map((item) => ({
          label: item.name,
          value: item.id,
        }));
    
        setTimeout(() => {
          this.autoComplete.show();
        });
      });
  }

  onSelectProduct(event: { value: ProductSearchItem | number }) {
    const productId = typeof event.value === 'object' ? event.value?.value : event.value;

    if (!productId) {
      return;
    }

    this._purchaseServices
      .getProductCartByProductId(productId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: ApiResponse<ProductUnitItem[]>) => {
        this.unitData = res.data;

        if (this.unitData.length === 0) {
          return;
        }

        this._productServices
          .getById(productId)
          .pipe(takeUntilDestroyed(this._destroyRef))
          .subscribe((productRes: any) => {
            const productTax = productRes?.data;
            this.currentProductTaxRates = {
              vatRate: Number(productTax?.vat) || 0,
              selectiveTaxRate: Number(productTax?.selectiveVat ?? productTax?.selectiveTaxRate) || 0,
            };

            const firstUnit = this.unitData[0];

            this.itemAddingForm.patchValue(
              {
                productCartId: firstUnit.id,
                productCode: firstUnit.productCode || '',
                productName: typeof event.value === 'object' ? event.value.label : firstUnit.productName || '',
                unitId: firstUnit.id,
                unitName: firstUnit.fromUnitName || firstUnit.name || '',
                price: firstUnit.purchasePrice ?? firstUnit.price ?? 0,
                qty: 1,
                discountRate: 0,
                discountAmount: 0,
                taxRate: this.currentProductTaxRates.vatRate,
                selectiveTaxRate: this.currentProductTaxRates.selectiveTaxRate,
              },
              { emitEvent: false },
            );

            this.calculateAddingRowTotals();
          });
      });
  }

  onUnitChange(selectedUnitId: number) {
    const selectedUnit = this.unitData.find((unit) => unit.id === selectedUnitId);
    if (!selectedUnit) {
      return;
    }

    this.itemAddingForm.patchValue(
      {
        unitId: selectedUnit.id,
        unitName: selectedUnit.fromUnitName || selectedUnit.name || '',
        price: selectedUnit.purchasePrice ?? selectedUnit.price ?? 0,
        productCartId: selectedUnit.id,
      },
      { emitEvent: false },
    );

    this.calculateAddingRowTotals();
  }

  searchByProductCode(e: Event) {
    const target = e.target as HTMLInputElement;
    const code = target.value?.trim();
    if (!code){
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'الكود غير موجود',
      })
      return
    } ;

    // if(this.itemAddingForm.invalid){
    //   this.itemAddingForm.markAllAsTouched();
    //   return;
    // }


    this._purchaseServices.searchByCode(code).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      if (res?.data) {
      const product = res?.data?.rows?.length > 0 ? res.data.rows[0] : res?.data;
      if (product && product.id) {
        this.loadProductToAddingRow(product);
        target.value = '';
      }
      } else {
        this._messageService.add({ severity: 'warn', summary: 'تنبيه', detail: 'الكود غير موجود' });
      }
    })

  }

  loadProductToAddingRow(
    product: ProductUnitItem & { productCart?: ProductUnitItem[]; productName?: string; code?: string; vat?: number; selectiveVat?: number; selectiveTaxRate?: number },
  ) {
    if (!product?.id) {
      return;
    }

    const units = product.productCart ?? [];
    const defaultUnit = units.find((unit) => unit.selected === true) ?? units[0] ?? product;
    const unitId = defaultUnit.id;
    const unitName = defaultUnit.fromUnitName || defaultUnit.name || '';
    const price = defaultUnit.purchasePrice ?? defaultUnit.price ?? 0;
    const vatRate = Number(product.vat) || 0;
    const selectiveTaxRate = Number(product.selectiveVat ?? product.selectiveTaxRate) || 0;

    const newRowGroup = this.createPurchaseDetail({
      productCartId: unitId,
      productCode: product.code || defaultUnit.productCode || '',
      productName: product.productName || '',
      warehouseId: this.purchaseForm.get('branchId')?.value ?? this.itemAddingForm.get('warehouseId')?.value,
      warehouseName: this.getWarehouseName(this.itemAddingForm.get('warehouseId')?.value),
      unitId,
      unitName,
      quantity: 1,
      purchasesPrice: price,
      disCountPercentage: 0,
      discountAmount: 0,
      vat: 0,
      net: 0,
    });

    newRowGroup.patchValue({ vatRate, selectiveTaxRate }, { emitEvent: false });
    this.syncRowTotals(newRowGroup);
    this.purchaseDetails.push(newRowGroup);
    this.searchControl.reset(null, { emitEvent: false });
  }

  private attachRowCalculations(row: FormGroup): void {
    row.valueChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this.syncRowTotals(row);
    });
  }

  private resolveDiscountSource(form: FormGroup, percentKey: string, amountKey: string): DiscountSource {
    if (form.get(percentKey)?.dirty) {
      return 'percent';
    }
    if (form.get(amountKey)?.dirty) {
      return 'amount';
    }
    return 'none';
  }

  calculateAddingRowTotals(): void {
    const result = this._calculationService.calculateLine({
      quantity: Number(this.itemAddingForm.get('qty')?.value) || 0,
      unitPrice: Number(this.itemAddingForm.get('price')?.value) || 0,
      discountPercent: Number(this.itemAddingForm.get('discountRate')?.value) || 0,
      discountAmount: Number(this.itemAddingForm.get('discountAmount')?.value) || 0,
      discountSource: this.resolveDiscountSource(this.itemAddingForm, 'discountRate', 'discountAmount'),
      vatRate: Number(this.itemAddingForm.get('taxRate')?.value) || 0,
      selectiveTaxRate: Number(this.itemAddingForm.get('selectiveTaxRate')?.value) || 0,
    });

    this.itemAddingForm.patchValue(
      {
        qty: result.quantity,
        price: result.unitPrice,
        discountRate: result.discountPercent,
        discountAmount: result.discountAmount,
        tax: result.vatAmount,
        total: result.netLineTotal,
      },
      { emitEvent: false },
    );
  }

  private getWarehouseName(warehouseId: number | null | undefined): string {
    if (!warehouseId) {
      return '';
    }
    return this.getDataInventories.find((inventory) => inventory.id === warehouseId)?.name ?? '';
  }

  private syncRowTotals(row: FormGroup): void {
    const result = this._calculationService.calculateLine({
      quantity: Number(row.get('quantity')?.value) || 0,
      unitPrice: Number(row.get('purchasesPrice')?.value) || 0,
      discountPercent: Number(row.get('disCountPercentage')?.value) || 0,
      discountAmount: Number(row.get('discountAmount')?.value) || 0,
      discountSource: this.resolveDiscountSource(row, 'disCountPercentage', 'discountAmount'),
      vatRate: Number(row.get('vatRate')?.value) || 0,
      selectiveTaxRate: Number(row.get('selectiveTaxRate')?.value) || 0,
      invoiceDiscountShare: Number(row.get('invoiceDiscountShare')?.value) || 0,
    });

    row.patchValue(
      {
        quantity: result.quantity,
        purchasesPrice: result.unitPrice,
        total: result.lineTotal,
        disCountPercentage: result.discountPercent,
        discountAmount: result.discountAmount,
        vat: result.vatAmount,
        vatDiscount: result.selectiveTaxAmount,
        totalDiscount: result.totalDiscount,
        net: result.netLineTotal,
      },
      { emitEvent: false },
    );

    this.calculateInvoiceTotals();
  }

  calculateInvoiceTotals() {
    const totals = this._calculationService.calculateInvoiceTotals(this.purchaseDetails.getRawValue());

    this.totalQuantities = totals.totalQuantities;
    this.totalDiscounts = totals.totalDiscounts;
    this.totalVat = totals.totalVat;
    this.totalSelectiveTax = totals.totalSelectiveTax;
    this.invoiceNetTotal = totals.invoiceNetTotal;

    this.purchaseForm.patchValue({ net: this.invoiceNetTotal }, { emitEvent: false });
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
    const vatRate = Number(rawData.taxRate) || 0;
    const selectiveTaxRate = Number(rawData.selectiveTaxRate) || 0;

    const itemGroup = this.createPurchaseDetail({
      productCartId: rawData.productCartId,
      productCode: rawData.productCode,
      productName: rawData.productName,
      warehouseId: rawData.warehouseId,
      warehouseName: this.getWarehouseName(rawData.warehouseId),
      unitId: rawData.unitId,
      unitName: rawData.unitName,
      quantity: rawData.qty,
      purchasesPrice: rawData.price,
      disCountPercentage: rawData.discountRate,
      discountAmount: rawData.discountAmount,
      vat: rawData.tax,
      net: rawData.total,
    });

    itemGroup.patchValue({ vatRate, selectiveTaxRate }, { emitEvent: false });
    this.syncRowTotals(itemGroup);

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
      taxRate: this.currentProductTaxRates.vatRate,
      selectiveTaxRate: this.currentProductTaxRates.selectiveTaxRate,
    });
    this.searchControl.reset();
    this.currentProductUnits = [];
  }

  // دالة حساب إجمالي الفاتورة التراكمي السفلي
  totalQuantities = 0;
  totalDiscounts = 0;
  totalVat = 0;
  totalSelectiveTax = 0;
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
    if (this.purchaseDetails.length === 0) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: 'برجاء إضافة صنف واحد على الأقل',
      });
      return;
    }

    if (this.purchaseForm.invalid) {
      this.purchaseForm.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();

    if (!this.isEditMode) {
      this._purchaseServices
        .createPurchase(payload)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe({
          next: (res) => {
            this._messageService.add({
              severity: 'success',
              summary: 'تم',
              detail: 'تم حفظ فاتورة الشراء بنجاح',
            });
            this.changeButtonState(res.data, true);
            this.purchaseForm.get('invoiceNumber')?.setValue(res.data);
            this.refreshActions();
          },
        });
      return;
    }

    const updatePayload: UpdatePurchasePayload = {
      ...payload,
      id: this.idUpdate,
      totalPrice: this.invoiceNetTotal,
      disCountPercentage: 0,
      discountAmount: this.totalDiscounts,
      allDiscount: this.totalDiscounts,
      vatDiscount: 0,
      totalDiscount: this.totalDiscounts,
    };

    this._purchaseServices
      .updatePurchase(updatePayload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'تم',
            detail: 'تم تعديل فاتورة الشراء بنجاح',
          });
        },
      });
  }

  reset() {
    this.purchaseForm.reset({
      invoiceNumber: 0,
      supplierId: null,
      purchasesDate: new Date(),
      notes: '',
      RefNum: '',
      orderPymentType: null,
      paymentMethod: null,
      supplierPhone: '',
      taxNumber: null,
      net: 0,
      expenses: '',
      branchId: null,
      paidCash: null,
      paidCashAccountId: null,
      networkPaid: null,
      networkPaidAccountId: null,
    });

    this.purchaseDetails.clear();
    this.itemAddingForm.reset({
      qty: 1,
      price: 0,
      discountRate: 0,
      discountAmount: 0,
      taxRate: 15,
      warehouseId: null,
      unitId: null,
    });

    this.totalQuantities = 0;
    this.totalDiscounts = 0;
    this.totalVat = 0;
    this.invoiceNetTotal = 0;
    this.printCount = 0;
    this.editCount = 0;
    this.unitData = [];
    this.searchControl.reset();
    this.changeButtonState(0, false);
    this.refreshActions();
  }

  delete() {
    this.showDeleteDialog = true;
  }

  deleteInvoice() {
    this._purchaseServices
      .deletePurchase(this.idUpdate)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          });
          this.showDeleteDialog = false;
          this.reset();
        },
      });
  }

  print() {
    this._messageService.add({
      severity: 'info',
      summary: 'تنبيه',
      detail: 'طباعة فاتورة الشراء غير متوفرة حالياً في واجهة البرمجة',
    });
  }

  searchInvoiceById() {
    const id = Number(this.invoiceSearchControl.value);
    if (!id) {
      return;
    }

    this.getPurchaseById(id);
  }

  prevInvoice() {
    const currentId = Number(this.purchaseForm.get('invoiceNumber')?.value);
    if (!currentId || currentId <= 1) {
      return;
    }
    this.getPurchaseById(currentId - 1);
  }

  nextInvoice() {
    const currentId = Number(this.purchaseForm.get('invoiceNumber')?.value);
    if (!currentId) {
      return;
    }
    this.getPurchaseById(currentId + 1);
  }

  private getPurchaseById(id: number) {
    this._purchaseServices
      .getPurchaseById(id)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          this.fillForm(res.data);
        },
        error: () => {
          this._messageService.add({
            severity: 'warn',
            summary: '',
            detail: 'الفاتورة غير موجودة',
          });
        },
      });
  }

  private fillForm(data: PurchaseResponse): void {
    this.purchaseForm.patchValue({
      invoiceNumber: data.id,
      supplierId: data.supplierId,
      purchasesDate: new Date(data.purchasesDate),
      notes: data.notes ?? '',
      RefNum: data.refNum ?? '',
      orderPymentType: data.orderPymentType,
      paymentMethod: data.paymentMethod,
      supplierPhone: data.supplierPhone ?? '',
      taxNumber: data.taxNumber ?? null,
      net: data.net,
      expenses: data.expenses ?? '',
      branchId: data.branchId ?? null,
      paidCash: data.paidCash ?? null,
      paidCashAccountId: data.paidCashAccountId ?? null,
      networkPaid: data.networkPaid ?? null,
      networkPaidAccountId: data.networkPaidAccountId ?? null,
    });

    this.purchaseDetails.clear();
    (data.purchaseDetails ?? []).forEach((detail) => {
      this.purchaseDetails.push(this.createPurchaseDetail(detail));
    });

    this.printCount = data.printCount ?? 0;
    this.editCount = data.editCount ?? 0;
    this.changeButtonState(data.id, true);
    this.calculateInvoiceTotals();
    this.purchaseForm.markAsPristine();
    this.purchaseForm.markAsUntouched();
    this.refreshActions();
  }

  private buildPayload(): CreatePurchasePayload {
    const raw = this.purchaseForm.getRawValue();
    const details = this.purchaseDetails.getRawValue() as Array<
      PurchaseDetailDto & { vatRate?: number; productCode?: string; productName?: string; warehouseName?: string; unitName?: string; unitId?: number }
    >;

    const branchId = raw.branchId ?? details[0]?.warehouseId ?? null;

    return {
      refNum: raw.RefNum || null,
      supplierPhone: raw.supplierPhone || null,
      taxNumber: raw.taxNumber ? String(raw.taxNumber) : null,
      supplierId: Number(raw.supplierId),
      purchasesDate: new Date(raw.purchasesDate).toISOString(),
      notes: raw.notes || null,
      orderPymentType: raw.orderPymentType,
      paymentMethod: raw.paymentMethod,
      vat: this.totalVat,
      expenses:
        raw.expenses !== '' && raw.expenses != null
          ? this._calculationService.roundPrice(Number(raw.expenses))
          : null,
      net: this.invoiceNetTotal,
      branchId,
      paidCash:
        raw.paidCash != null && raw.paidCash !== ''
          ? this._calculationService.roundPrice(Number(raw.paidCash))
          : null,
      paidCashAccountId: raw.paidCashAccountId ?? null,
      networkPaid:
        raw.networkPaid != null && raw.networkPaid !== ''
          ? this._calculationService.roundPrice(Number(raw.networkPaid))
          : null,
      networkPaidAccountId: raw.networkPaidAccountId ?? null,
      purchaseDetails: details.map((detail) => ({
        productCartId: detail.productCartId,
        warehouseId: Number(detail.warehouseId),
        quantity: Number(detail.quantity),
        purchasesPrice: Number(detail.purchasesPrice),
        total: this._calculationService.roundPrice(Number(detail.quantity) * Number(detail.purchasesPrice)),
        vat: Number(detail.vat),
        disCountPercentage: Number(detail.disCountPercentage),
        discountAmount: Number(detail.discountAmount),
        vatDiscount: Number(detail.vatDiscount ?? 0),
        totalDiscount: Number(detail.totalDiscount ?? detail.discountAmount ?? 0),
        net: Number(detail.net),
      })),
    };
  }

  ngOnDestroy(): void {
    this._sharedStateService.clearSelectedId();
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

  onEnterSupplier(event: Event) {
    if (this.supplierSearchControl.invalid) {
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
        this.supplierSearchControl.reset();
        this.items = [];
      });
  }
}
