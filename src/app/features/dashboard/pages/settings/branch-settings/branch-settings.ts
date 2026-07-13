import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DatePicker } from 'primeng/datepicker';
import { MessageService } from 'primeng/api';
import { switchMap } from 'rxjs';
import { onlyNumberDirective } from '../../../../../shared/directives/only-number';
import { SharedConfirmDialog } from '../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog';
import { FormError } from '../../../../../shared/ui/form-error/form-error';
import { entityNameValidator } from '../../../../../shared/validations/entity-name-validator';
import { EmailValidation } from '../../../../../shared/validations/email';
import { egyptSaudiPhoneValidator } from '../../../../../shared/validations/phoneNumber';
import { InventoriesServices } from '../../products/inventories/services/inventories-services';
import { CostCenterService } from '../../costcenter-and-projects/cost-center/services/cost-center';
import { ApplicationSettingsModel } from '../models/application-settings';
import { ApplicationSettingsService } from '../services/application-settings-service';
import { BalanceRate } from '../../../../../shared/Enums/BalanceRate';

@Component({
  selector: 'app-branch-settings',
  imports: [
    NgTemplateOutlet,
    NgClass,
    NgSelectComponent,
    DatePicker,
    ReactiveFormsModule,
    SharedConfirmDialog,
    onlyNumberDirective,
    FormError,
  ],
  templateUrl: './branch-settings.html',
  styleUrl: './branch-settings.scss',
})
export class BranchSettings implements OnInit {
  private readonly _fb = inject(FormBuilder);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _applicationSettingsService = inject(ApplicationSettingsService);
  private readonly _inventoriesServices = inject(InventoriesServices);
  private readonly _costCenterService = inject(CostCenterService);
  private readonly _messageService = inject(MessageService);

  currentTemplate: 'company' | 'main' | 'finance' = 'company';
  showResetAllDialog = false;
  currentBranchId = 0;
  private useSampleDropdownDefaults = false;

  warehousesList: { id: number; name: string }[] = [];
  costCentersList: { id: number; nameAr: string }[] = [];


//  0:6
//  1:5,
//  2:4,
//  3:3,
//  4:2,
//  5:1,
//  6:0,


  BalancerateList = [
    {
      id: BalanceRate.One,
      name: '0:6',
    },
    {
      id: BalanceRate.Two,
      name: '1:5',
    },
    {
      id: BalanceRate.Three,
      name: '2:4',
    },
    {
      id: BalanceRate.Four,
      name: '3:3',
    },
    {
      id: BalanceRate.Five,
      name: '4:2',
    },
    {
      id: BalanceRate.Six,
      name: '5:1',
    },
    {
      id: BalanceRate.Seven,
      name: '6:0',
    },
  ];


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


  currencyOptions = [
    { id: 1, name: 'ريال سعودي' },
    { id: 2, name: 'دولار أمريكي' },
    { id: 3, name: 'يورو' },
  ];

  discountMethodOptions = [
    { id: 1, name: 'سعر شامل ضريبة القيمة المضافة' },
    { id: 2, name: 'سعر غير شامل ضريبة القيمة المضافة' },
  ];

  statisticsOptions = [
    { id: true, name: 'مفعّل' },
    { id: false, name: 'غير مفعّل' },
  ];

  balanceRateOptions = [
    { id: 1, name: '1' },
    { id: 2, name: '2' },
    { id: 3, name: '3' },
  ];

  showCustomersData = [
    { id: 1, name: 'أظهار العملاء' },
    { id: 2, name: 'الموردين' },
    { id: 3, name: ' العملاء والموردين' },
    { id: 4, name: ' إخفاء العملاء والموردين للفروع' },
  ];

  settingsForm = this._fb.group({
    branchId: [0],
    priceType: [1],
    priceDisplayType: [0],
    companyNameAr: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        entityNameValidator(),
      ],
    ],
    companyNameEn: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(200),
        entityNameValidator(),
      ],
    ],
    identityTypeId: [0, [Validators.required, Validators.min(1)]],
    identityNumber: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(14)],
    ],
    taxNumber: [
      '',
      [Validators.required, Validators.minLength(9), Validators.maxLength(15)],
    ],
    additionalNumber: ['', [Validators.maxLength(10)]],
    email: ['', [Validators.required, EmailValidation]],
    website: ['', [Validators.maxLength(200)]],
    bankAccountNumber: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(34)],
    ],
    currency: [1, [Validators.required]],
    decimalPrice: [0, [Validators.required, Validators.min(0), Validators.max(6)]],
    decimalQuantity: [0, [Validators.required, Validators.min(0), Validators.max(6)]],
    purchaseStoreId: [null as number | null, [Validators.required]],
    salesStoreId: [null as number | null, [Validators.required]],
    reservationStoreId: [null as number | null, [Validators.required]],
    costCenterId: [null as number | null, [Validators.required]],
    enableStatistics: [true, [Validators.required]],
    discountMethod: [1, [Validators.required]],
    minimumSelectiveTax: [0, [Validators.required, Validators.min(0)]],
    customerSupplierDisplayType: [true as boolean | number, [Validators.required]],
    balanceRate: [1, [Validators.required]],
    printName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(200)],
    ],
    postalCode: [
      '',
      [Validators.required, Validators.minLength(4), Validators.maxLength(10)],
    ],
    city: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    district: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    country: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    street: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    addressDetails: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(500)],
    ],
    buildingNumber: ['', [Validators.required, Validators.maxLength(10)]],
    mobile: ['', [Validators.required, egyptSaudiPhoneValidator]],
    fax: ['', [Validators.maxLength(15)]],
    phone: ['', [Validators.maxLength(15)]],
    enableDiscounts: [true],
    enableWeightedBalanceColor: [true],
    enableExpiryAndBatch: [true],
    repeatTaxNumber: [true],
    enableArabicName: [true],
    enableEnglishName: [true],
    enablePrice: [true],
    enableImage: [true],
    printInCashier: [true],
    printInvoice: [true],
    printSalesReturns: [true],
    printCollectionReceipt: [true],
    saveInvoiceType: [1],
    printType: [1],
  });

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadSettings();
  }

  fillSampleData(): void {
    this.useSampleDropdownDefaults = true;
    this.patchSettingsForm(this.getSampleSettings());
    this.applyDropdownDefaults();

    // this._messageService.add({
    //   severity: 'info',
    //   summary: 'بيانات تجريبية',
    //   detail: 'تم ملء النموذج ببيانات أساسية للاختبار',
    // });
  }

  save(): void {
    if (this.settingsForm.invalid) {
      this.settingsForm.markAllAsTouched();
      this.switchToInvalidTab();
      return;
    }

    const payload = this.buildUpsertPayload();

    this._applicationSettingsService
      .upsert(payload)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم حفظ الإعدادات بنجاح',
          });
          this.loadSettingsByBranch(this.currentBranchId);
        },
      });
  }

  resetMovements(): void {
    this._applicationSettingsService
      .resetMovements()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إعادة تهيئة الحركات بنجاح',
          });
        },
      });
  }

  resetMovementsAndProducts(): void {
    this._applicationSettingsService
      .resetMovementsAndProducts()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إعادة تهيئة الحركات والأصناف بنجاح',
          });
        },
      });
  }

  openResetAllDialog(): void {
    this.showResetAllDialog = true;
  }

  confirmResetAllData(): void {
    this._applicationSettingsService
      .resetAllData()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: () => {
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم إعادة تهيئة جميع البيانات بنجاح',
          });
          this.showResetAllDialog = false;
          this.loadSettingsByBranch(this.currentBranchId);
        },
      });
  }

  cancelResetAllDialog(): void {
    this.showResetAllDialog = false;
  }

  private loadSettings(): void {
    this._applicationSettingsService
      .getAll()
      .pipe(
        // switchMap((res:any) => {
        //   const branchId = this.resolveBranchId(res.data);
        //   this.currentBranchId = branchId;
        //   // return this._applicationSettingsService.getByBranch(branchId);
        // }),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe({
        next: (res:any) => {
          if (res?.data && this.hasSettingsData(res.data)) {
            this.patchSettingsForm(res.data);
          } else {
            this.useSampleDropdownDefaults = true;
            this.fillSampleData();
          }
        },
        error: () => {
          this.useSampleDropdownDefaults = true;
          this.fillSampleData();
        },
      });
  }

  private loadSettingsByBranch(branchId: number): void {
    this._applicationSettingsService
      .getByBranch(branchId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res) => {
          if (res?.data) {
            this.patchSettingsForm(res.data);
          }
        },
      });
  }

  private loadDropdowns(): void {
    this._inventoriesServices
      .getAllWithoutPagination()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.warehousesList = (res?.data?.rows ?? []).map((item: any) => ({
            id: item.id,
            name: item.name ?? item.nameAr ?? '',
          }));
          this.applyDropdownDefaults();
        },
      });

    this._costCenterService
      .getAllSendInQuery()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe({
        next: (res: any) => {
          this.costCentersList = this.flattenCostCenters(res?.data ?? []);
          this.applyDropdownDefaults();
        },
      });
  }

  private patchSettingsForm(data: ApplicationSettingsModel): void {
    this.currentBranchId = data.branchId ?? this.currentBranchId;

    this.settingsForm.patchValue({
      branchId: data.branchId ?? 0,
      priceType: data.priceType ?? 1,
      priceDisplayType: data.priceDisplayType ?? 0,
      companyNameAr: data.companyNameAr ?? '',
      companyNameEn: data.companyNameEn ?? '',
      identityTypeId: data.identityTypeId ?? 0,
      identityNumber: data.identityNumber ?? '',
      taxNumber: data.taxNumber ?? '',
      additionalNumber: data.additionalNumber ?? '',
      email: data.email ?? '',
      website: data.website ?? '',
      bankAccountNumber: data.bankAccountNumber ?? '',
      currency: data.currency ?? 1,
      decimalPrice: data.decimalPrice ?? 0,
      decimalQuantity: data.decimalQuantity ?? 0,
      purchaseStoreId: data.purchaseStoreId || null,
      salesStoreId: data.salesStoreId || null,
      reservationStoreId: data.reservationStoreId || null,
      costCenterId: data.costCenterId || null,
      enableStatistics: data.enableStatistics ?? true,
      discountMethod: data.discountMethod ?? 1,
      minimumSelectiveTax: data.minimumSelectiveTax ?? 0,
      customerSupplierDisplayType: this.mapCustomerSupplierDisplayTypeFromApi(
        data.customerSupplierDisplayType
      ),
      balanceRate: data.balanceRate ?? 1,
      printName: data.printName ?? '',
      postalCode: data.postalCode ?? '',
      city: data.city ?? '',
      district: data.district ?? '',
      country: data.country ?? '',
      street: data.street ?? '',
      addressDetails: data.addressDetails ?? '',
      buildingNumber: data.buildingNumber ?? '',
      mobile: data.mobile ?? '',
      fax: data.fax ?? '',
      phone: data.phone ?? '',
      enableDiscounts: data.enableDiscounts ?? true,
      enableWeightedBalanceColor: data.enableWeightedBalanceColor ?? true,
      enableExpiryAndBatch: data.enableExpiryAndBatch ?? true,
      repeatTaxNumber: data.repeatTaxNumber ?? true,
      enableArabicName: data.enableArabicName ?? true,
      enableEnglishName: data.enableEnglishName ?? true,
      enablePrice: data.enablePrice ?? true,
      enableImage: data.enableImage ?? true,
      printInCashier: data.printInCashier ?? true,
      printInvoice: data.printInvoice ?? true,
      printSalesReturns: data.printSalesReturns ?? true,
      printCollectionReceipt: data.printCollectionReceipt ?? true,
      saveInvoiceType: data.saveInvoiceType ?? 1,
      printType: data.printType ?? 1,
    });
  }

  private buildUpsertPayload(): ApplicationSettingsModel {
    const raw = this.settingsForm.getRawValue();

    return {
      branchId: raw.branchId ?? this.currentBranchId ?? 0,
      priceType: Number(raw.priceType ?? 1),
      priceDisplayType: Number(raw.priceDisplayType ?? 0),
      companyNameAr: raw.companyNameAr ?? '',
      companyNameEn: raw.companyNameEn ?? '',
      identityTypeId: Number(raw.identityTypeId ?? 0),
      identityNumber: raw.identityNumber ?? '',
      taxNumber: raw.taxNumber ?? '',
      additionalNumber: raw.additionalNumber ?? '',
      email: raw.email ?? '',
      website: raw.website ?? '',
      bankAccountNumber: raw.bankAccountNumber ?? '',
      currency: Number(raw.currency ?? 1),
      decimalPrice: Number(raw.decimalPrice ?? 0),
      decimalQuantity: Number(raw.decimalQuantity ?? 0),
      purchaseStoreId: Number(raw.purchaseStoreId ?? 0),
      salesStoreId: Number(raw.salesStoreId ?? 0),
      reservationStoreId: Number(raw.reservationStoreId ?? 0),
      costCenterId: Number(raw.costCenterId ?? 0),
      enableStatistics: !!raw.enableStatistics,
      discountMethod: Number(raw.discountMethod ?? 1),
      minimumSelectiveTax: Number(raw.minimumSelectiveTax ?? 0),
      customerSupplierDisplayType: this.normalizeCustomerSupplierDisplayType(
        raw.customerSupplierDisplayType
      ),
      balanceRate: Number(raw.balanceRate ?? 1),
      printName: raw.printName ?? '',
      postalCode: raw.postalCode ?? '',
      city: raw.city ?? '',
      district: raw.district ?? '',
      country: raw.country ?? '',
      street: raw.street ?? '',
      addressDetails: raw.addressDetails ?? '',
      buildingNumber: raw.buildingNumber ?? '',
      mobile: raw.mobile ?? '',
      fax: raw.fax ?? '',
      phone: raw.phone ?? '',
      enableDiscounts: !!raw.enableDiscounts,
      enableWeightedBalanceColor: !!raw.enableWeightedBalanceColor,
      enableExpiryAndBatch: !!raw.enableExpiryAndBatch,
      repeatTaxNumber: !!raw.repeatTaxNumber,
      enableArabicName: !!raw.enableArabicName,
      enableEnglishName: !!raw.enableEnglishName,
      enablePrice: !!raw.enablePrice,
      enableImage: !!raw.enableImage,
      printInCashier: !!raw.printInCashier,
      printInvoice: !!raw.printInvoice,
      printSalesReturns: !!raw.printSalesReturns,
      printCollectionReceipt: !!raw.printCollectionReceipt,
      saveInvoiceType: Number(raw.saveInvoiceType ?? 1),
      printType: Number(raw.printType ?? 1),
    };
  }

  private normalizeCustomerSupplierDisplayType(value: boolean | number | null | undefined): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 4;
    }

    return true;
  }

  private mapCustomerSupplierDisplayTypeFromApi(value: boolean | number | null | undefined): number {
    if (typeof value === 'number') {
      return value;
    }

    return value ? 3 : 4;
  }

  private resolveBranchId(data: unknown): number {
    if (!data) {
      return 0;
    }

    if (Array.isArray(data)) {
      return data[0]?.branchId ?? 0;
    }

    if (typeof data === 'object') {
      const record = data as Record<string, unknown>;

      if ('branchId' in record && !('rows' in record)) {
        return Number(record['branchId'] ?? 0);
      }

      if ('rows' in record && Array.isArray(record['rows']) && record['rows'].length) {
        return Number((record['rows'][0] as ApplicationSettingsModel)?.branchId ?? 0);
      }
    }

    return 0;
  }

  private flattenCostCenters(data: any[]): { id: number; nameAr: string }[] {
    const result: { id: number; nameAr: string }[] = [];

    const flatten = (items: any[]) => {
      items.forEach((item) => {
        const { children, ...rest } = item;
        result.push({
          id: rest.id,
          nameAr: rest.nameAr ?? rest.name ?? '',
        });

        if (children?.length) {
          flatten(children);
        }
      });
    };

    flatten(data);
    return result;
  }

  private getSampleSettings(): ApplicationSettingsModel {
    return {
      branchId: this.currentBranchId || 1,
      priceType: 1,
      priceDisplayType: 0,
      companyNameAr: 'شركة العنكبوت للتجارة',
      companyNameEn: 'Spider Trading Company',
      identityTypeId: 1,
      identityNumber: '1010123456',
      taxNumber: '300012345678903',
      additionalNumber: '1234',
      email: 'info@spider-erp.com',
      website: 'https://www.spider-erp.com',
      bankAccountNumber: 'SA0380000000608010167519',
      currency: 1,
      decimalPrice: 2,
      decimalQuantity: 2,
      purchaseStoreId: 0,
      salesStoreId: 0,
      reservationStoreId: 0,
      costCenterId: 0,
      enableStatistics: true,
      discountMethod: 1,
      minimumSelectiveTax: 1000,
      customerSupplierDisplayType: 3,
      balanceRate: 1,
      printName: 'شركة العنكبوت للتجارة',
      postalCode: '12345',
      city: 'الرياض',
      district: 'العليا',
      country: 'المملكة العربية السعودية',
      street: 'طريق الملك فهد',
      addressDetails: 'مبنى رقم 10، الدور الثاني',
      buildingNumber: '7890',
      mobile: '0501234567',
      fax: '0112345678',
      phone: '0118765432',
      enableDiscounts: true,
      enableWeightedBalanceColor: true,
      enableExpiryAndBatch: true,
      repeatTaxNumber: false,
      enableArabicName: true,
      enableEnglishName: true,
      enablePrice: true,
      enableImage: true,
      printInCashier: true,
      printInvoice: true,
      printSalesReturns: true,
      printCollectionReceipt: true,
      saveInvoiceType: 1,
      printType: 1,
    };
  }

  private applyDropdownDefaults(): void {
    if (!this.useSampleDropdownDefaults) {
      return;
    }

    const firstWarehouse = this.warehousesList[0]?.id ?? null;
    const firstCostCenter = this.costCentersList[0]?.id ?? null;

    if (!firstWarehouse && !firstCostCenter) {
      return;
    }

    if (firstWarehouse) {
      this.settingsForm.patchValue({
        purchaseStoreId: firstWarehouse,
        salesStoreId: firstWarehouse,
        reservationStoreId: firstWarehouse,
      });
    }

    if (firstCostCenter) {
      this.settingsForm.patchValue({
        costCenterId: firstCostCenter,
      });
    }

    this.useSampleDropdownDefaults = false;
  }

  private switchToInvalidTab(): void {
    const companyFields = [
      'companyNameAr',
      'companyNameEn',
      'identityTypeId',
      'identityNumber',
      'taxNumber',
      'email',
      'bankAccountNumber',
    ];
    const financeFields = [
      'currency',
      'decimalPrice',
      'decimalQuantity',
      'purchaseStoreId',
      'salesStoreId',
      'reservationStoreId',
      'costCenterId',
      'minimumSelectiveTax',
      'discountMethod',
      'customerSupplierDisplayType',
      'balanceRate',
    ];

    if (companyFields.some((field) => this.settingsForm.get(field)?.invalid)) {
      this.currentTemplate = 'company';
      return;
    }

    if (financeFields.some((field) => this.settingsForm.get(field)?.invalid)) {
      this.currentTemplate = 'finance';
      return;
    }

    this.currentTemplate = 'main';
  }

  private hasSettingsData(data: ApplicationSettingsModel): boolean {
    return !!(
      data.companyNameAr?.trim() ||
      data.companyNameEn?.trim() ||
      data.taxNumber?.trim() ||
      data.email?.trim()
    );
  }
}
