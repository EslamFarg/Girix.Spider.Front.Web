import { Component, DestroyRef, HostListener, inject, ViewChild } from '@angular/core';
import { FormComponentBase } from '../../../../../../shared/base/form-component-base';
import { FormArray, FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsServices } from '../../groups/services/groups';
import { CategoriesServices } from '../../categories/services/categories-services';
import { UnitOfMeasure } from '../../units-of-measurement/services/unit-of-measure';
import { MessageService } from 'primeng/api';
import { ProductCardService } from '../services/product-card';
import { AutoComplete, AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { Row, unitOfMeasure } from '../../units-of-measurement/models/unit-of-meaure';
import { Totals } from '../../../../../../shared/services/calculations/totals';
import { entityNameValidator } from '../../../../../../shared/validations/entity-name-validator';
import { SearchableColumnEnum } from '../../../../../../shared/Enums/enumSearch';
import { productType } from '../../../../../../shared/Enums/product-type.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { buildSearchPayload } from '../../../../../../shared/config/search-config';
import { PageHeader } from "../../../../../../shared/ui/page-header/page-header";
import { NgClass } from '@angular/common';
import { FormError } from "../../../../../../shared/ui/form-error/form-error";
import { NgSelectComponent } from '@ng-select/ng-select';
import { Dialog } from "primeng/dialog";
import { OnlyStringDirective } from '../../../../../../shared/directives/only-string';
import { onlyNumberDirective } from '../../../../../../shared/directives/only-number';
import { SharedStateServices } from '../../../../../../shared/services/shared-state-services';
import { SharedConfirmDialog } from "../../../../../../shared/ui/shared-confirm-dialog/shared-confirm-dialog";

@Component({
  selector: 'app-add-product',
  imports: [PageHeader, ReactiveFormsModule, AutoCompleteModule, NgClass, FormError, NgSelectComponent, Dialog, OnlyStringDirective, onlyNumberDirective, SharedConfirmDialog],
  templateUrl: './add-product.html',
  styleUrl: './add-product.scss',
})
export class AddProduct extends FormComponentBase{

  // !!!!!!!!!!!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _destroyRef: DestroyRef = inject(DestroyRef);
  _groupServices = inject(GroupsServices);
  _categoryServices = inject(CategoriesServices);
  _UnitOfMeasureServices = inject(UnitOfMeasure);
  _messageService: MessageService = inject(MessageService);
  _productServices: ProductCardService = inject(ProductCardService);
  _sharedStateServices: SharedStateServices = inject(SharedStateServices);
  // !!!!!!!!!!!!!!!!!!! Properties
  @ViewChild('autoComplete') autoComplete!: AutoComplete;
  date2: Date | undefined;
  dataGroups: Row[] = [];
  dataCategories: Row[] = [];
  dataUnitOfMeasure: unitOfMeasure[] = [];
  dataUnitOfMeasureSmaller: unitOfMeasure[] = [];
  _totals: Totals = inject(Totals);
  currentSearch: any = null;
  vatTypes = [
    { textVat: 'E (معفي من الضريبة)', valueVat: 'E' },
    { textVat: 'S (خاضع للضريبة بنسبة قياسية 5% أو 15%)', valueVat: 'S' },
    { textVat: 'Z (خاضع لضريبة بنسبة صفر)', valueVat: 'Z' },
    { textVat: 'O (عكس ضريبي Reverse Charge)', valueVat: 'O' },
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
    { text: 'سبب آخر يحدد حسب الحالة', value: 'VATEX-SA-OOS' },
  ];

  searchControl = new FormControl('', Validators.required);
  productForm: any = this._fb.group({
    code: ['', [Validators.maxLength(100)]],
    nameAr: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        entityNameValidator(),
      ],
    ],
    nameEn: [
      '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
        entityNameValidator(),
      ],
    ],
    productType: [null, [Validators.required]] as any,
    categoryId: [null, [Validators.required]] as any,
    groupId: [null, [Validators.required]] as any,
    vat: [null, [Validators.required]],
    selectiveVat: [null, [Validators.required]],
    isScaleItem: [true],
    vatCode: [null, [Validators.required]],
    taxExemptionReasonCode: [''],
    taxExemptionReason: [null, [Validators.required]] as any,
    productCards: this._fb.array([]) as any,
  });

  createProductCard() {
    return this._fb.group({
      id: [0],
      unitOfMeasureId: [null, [Validators.required]],
      isBaseUnit: [true, [Validators.required]],
      smallerUnitId: [null] as any,
      conversionFactor: [null, [Validators.required]] as any,
      purchasePrice: [null, [Validators.required]],
      retailPrice: [null, [Validators.required]],
      wholesalePrice: [null],
      barcode1: [''],
      barcode2: [''],
      isDefaultSellingUnit: [true],
    });
  }

  newProductCardForm = this.createProductCard();
  unitMap = new Map<number, string>();
  lastUnitId: number | null = null;
  selectedSearchType: any = 'code';
  pageSize = 10;
  SearchValEnum: any = SearchableColumnEnum.Code;
  showDeleteDialog = false;
  // !!!!!!!!!!! Methods

  ngOnInit() {
    this.productForm.patchValue({
      productType: this.typeProduct[0]?.id,
    });
    this.newProductCardForm.get('unitOfMeasureId')?.valueChanges.subscribe(() => {
      if (this.isEditProductCard) {
        return;
      }

      if (this.productCards.length === 0) {
        this.newProductCardForm.patchValue(
          {
            smallerUnitId: 0,
            isBaseUnit: true,
            conversionFactor: 1,
          },
          {
            emitEvent: false,
          },
        );
      } else {
        this.newProductCardForm.patchValue(
          {
            smallerUnitId: this.getPreviousUnitId(),
            isBaseUnit: false,
          },
          {
            emitEvent: false,
          },
        );
      }
    });

    this.newProductCardForm.get('isBaseUnit')?.valueChanges.subscribe((isBase) => {
      const conversion = this.newProductCardForm.get('conversionFactor');

      if (isBase) {
        conversion?.setValue(1, { emitEvent: false });
        conversion?.disable({ emitEvent: false });
      } else {
        conversion?.enable({ emitEvent: false });
        conversion?.reset(null, { emitEvent: false });
      }
    });

    this.getAllDataGroup();
    this.getAllDataCategories();
    this.getAllDataUnitOfMeasure();
    // this.getAllData();

    this.initVatLogic();
    this.loadProductFromExplorer();
    this.refreshActions();
  }


    loadProductFromExplorer() {
   const id:any=this._sharedStateServices.selectedId$();
   console.log(id);
   if(id){
    this._productServices.getById(id).pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      // console.log(res);
      this.loadProduct(res.data);

        this._sharedStateServices.clearSelectedId();
    })
   }
    
  }

  initVatLogic(): void {
    this.productForm.get('vatCode')?.valueChanges.subscribe((code: any) => {
      this.productForm.patchValue(
        {
          taxExemptionReasonCode: code,
        },
        { emitEvent: false },
      );

      const reasonControl = this.productForm.get('taxExemptionReason');

      if (code === 'E' || code === 'O') {
        reasonControl?.enable();

        if (!reasonControl?.value) {
          reasonControl?.setValue('VATEX-SA-29');
        }
      } else {
        reasonControl?.setValue('VATEX-SA-29');
        reasonControl?.disable();
      }
    });
  }
  get productCards(): FormArray {
    return this.productForm.get('productCards') as FormArray;
  }

  units: any = [];
  isEditProductCard = false;
  editIndex = -1;
  // addProductCard() {

  // if (this.newProductCardForm.invalid) {
  //   this.newProductCardForm.markAllAsTouched();
  //   return;
  // }

  // const isDefault =
  //   this.newProductCardForm.get('isDefaultSellingUnit')?.value;

  // // لو المختار Default شيل الـ Default من الباقى
  // if (isDefault) {
  //   this.productCards.controls.forEach(control => {
  //     control.patchValue({
  //       isDefaultSellingUnit: false
  //     });
  //   });
  // }

  // this.productCards.push(
  //   this._fb.group(this.newProductCardForm.getRawValue())
  // );

  // this.newProductCardForm.reset({
  //   isBaseUnit: true,
  //   isDefaultSellingUnit: false
  // });

  // }
  private getPreviousUnitId(): number | null {
    if (this.productCards.length === 0) {
      return null;
    }

    return this.productCards.at(this.productCards.length - 1).get('unitOfMeasureId')?.value;
  }

  addProductCard() {
    if (this.newProductCardForm.invalid) {
      this.newProductCardForm.markAllAsTouched();
      return;
    }

    const value = this.newProductCardForm.getRawValue();

    if (value.unitOfMeasureId === value.smallerUnitId) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'لا يمكن أن تكون الوحدة والوحدة المصغرة متساويتين',
      });

      return;
    }
    const exists = this.isDuplicate(
      (control) =>
        control.get('unitOfMeasureId')?.value === value.unitOfMeasureId &&
        control.get('smallerUnitId')?.value === value.smallerUnitId,
    );

    const exists2 = this.isDuplicate(
      (control) => control.get('unitOfMeasureId')?.value === value.unitOfMeasureId,
    );

    const exists3 = this.isDuplicate(
      (control) => control.get('smallerUnitId')?.value === value.smallerUnitId,
    );

    if (exists) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'هذه الوحدة مع الوحدة المصغرة موجودة بالفعل',
      });
      return;
    }

    if (exists2) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'هذه الوحدة تمت إضافتها بالفعل',
      });
      return;
    }

    if (exists3) {
      this._messageService.add({
        severity: 'warn',
        summary: 'تنبيه',
        detail: 'هذه الوحدة المصغرة تمت إضافتها بالفعل',
      });
      return;
    }
    // لو المختار Default
    if (value.isDefaultSellingUnit) {
      this.productCards.controls.forEach((control) => {
        control.patchValue({
          isDefaultSellingUnit: false,
        });
      });
    }

    if (this.isEditProductCard) {
      this.productCards.at(this.editIndex).patchValue(value);

      this.isEditProductCard = false;
      this.editIndex = -1;
    } else {
      this.productCards.push(this._fb.group(value));
      // this.lastUnitId = value.unitOfMeasureId;
    }

    const previousUnit = this.getPreviousUnitId();

    this.newProductCardForm.reset({
      unitOfMeasureId: null,
      smallerUnitId: previousUnit,
      isBaseUnit: previousUnit === null,
      isDefaultSellingUnit: false,
    });
  }

  private isDuplicate(predicate: (control: any) => boolean): boolean {
    return this.productCards.controls.some((control, index) => {
      if (this.isEditProductCard && index === this.editIndex) {
        return false;
      }

      return predicate(control);
    });
  }
  editProductCard(index: number) {
    this.isEditProductCard = true;
    this.editIndex = index;

    const data = this.productCards.at(index).getRawValue();

    this.newProductCardForm.patchValue(data);
  }
  removeProductCard(index: number) {
    this.productCards.removeAt(index);
    const previousUnit = this.getPreviousUnitId();

    this.newProductCardForm.patchValue({
      smallerUnitId: previousUnit,
      isBaseUnit: previousUnit === null,
    });
  }

  typeProduct = [
    {
      id: productType.Inventory,
      name: 'مخزني',
    },
    {
      id: productType.Service,
      name: 'خدمي',
    },
  ];

  paymentMethod = [
    {
      name: 'كاش',
      id: 1,
    },
    {
      id: 2,
      name: 'اجل',
    },
    {
      name: 'شيك',
      id: 3,
    },
  ];

  taxValueSelect = [
    {
      id: 0,
      name: 'معفي من ضريبة القيمة المضافة',
      value: 0,
    },
    {
      id: 0,
      name: 'ضريبة القيمة المضافة (%5)',
      value: 5,
    },
    {
      id: 0,
      name: 'ضريبة القيمة المضافة (%14)',
      value: 14,
    },
    {
      id: 0,
      name: 'ضريبة القيمة المضافة (%15)',
      value: 15,
    },
  ];
  taxValueSelective = [
    {
      id: 0,
      name: 'معفي من الضريبة الانتقائية',
      value: 0,
    },
    {
      id: 0,
      name: 'ضريبة القيمة الانتقائية (%25)',
      value: 25,
    },
    {
      id: 0,
      name: 'ضريبة القيمة الانتقائية (%50)',
      value: 50,
    },
    {
      id: 0,
      name: 'ضريبة القيمة الانتقائية (%75)',
      value: 75,
    },
    {
      id: 0,
      name: 'ضريبة القيمة الانتقائية (%100)',
      value: 100,
    },
  ];

  explorerBtn = {
    // label:'مستكشف فاتورة مبيعات',
    // link:'/display-sales-prices/explorer'
  };

  items: any[] = [];
  value: any;

  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  showSearchBox: boolean = false;
  selectedSearch = 'كود الصنف';

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    const targetElement = event.target.closest('.search_input') as HTMLElement;
    if (!targetElement) {
      this.showSearchBox = false;
    }
  }

  getAllDataGroup() {
    this._groupServices
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.dataGroups = res.data.rows;
        this.productForm.patchValue({
          groupId: this.dataGroups[0]?.id,
        });
      });
  }

  getAllDataCategories() {
    this._categoryServices
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.dataCategories = res.data.rows;
        this.productForm.patchValue({
          categoryId: this.dataCategories[0]?.id,
        });

        // console.log(this.dataCategories);
      });
  }

  getAllDataUnitOfMeasure() {
    this._UnitOfMeasureServices
      .getAllSendInQuery(0, 0)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res: any) => {
        this.dataUnitOfMeasure = res.data.rows;
        this.dataUnitOfMeasureSmaller = [
          {
            id: 0,
            name: 'لا يوجد',
          },
          ...res.data.rows,
        ];

        this.dataUnitOfMeasure.forEach((unit: any) => {
          this.unitMap.set(unit.id, unit.name);
        });
        // console.log(this.unitMap);
      });
  }

  setDefaultSellingUnit(index: number) {
    this.productCards.controls.forEach((control, i) => {
      control.patchValue({
        isDefaultSellingUnit: i === index,
      });
    });
  }

  // ******* search

  
 prevProduct() {
  const currentCode = Number(this.productForm.get('code')?.value);


  if (!currentCode || currentCode <= 1) {
    return;
  }

  const newCode = currentCode - 1;

  this.productForm.patchValue({
    code: newCode
  });

  this.getProductByCode(newCode);
}

nextProduct() {
  const currentCode = Number(this.productForm.get('code')?.value);

  if(!currentCode){
    return;
  }
  if (isNaN(currentCode)) {
    return;
  }

  const newCode = currentCode + 1;

  this.productForm.patchValue({
    code: newCode
  });

  this.getProductByCode(newCode);
}

getProductByCode(code: number) {
  const payload = buildSearchPayload(
    code.toString(),
    1,
    SearchableColumnEnum.Code
  );

  this._productServices.search(payload).subscribe((res: any) => {


      if (!res?.data?.rows || res.data.rows.length === 0) {

        this._messageService.add({
          severity: 'warn',
          summary: 'تنبيه',
          detail: `لا يوجد صنف بالكود ${code}`
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

  this.productCards.clear();

  data.productCardDetails.forEach((card: any) => {
    const form = this.createProductCard();
    form.patchValue(card);
    this.productCards.push(form);
  });

  this.productForm.patchValue({
    code: data.code,
    nameAr: data.nameAr,
    nameEn: data.nameEn,
    productType: data.productTypeId,
    categoryId: data.categoryId,
    groupId: data.groupId,
    vat: data.vatRate,
    selectiveVat: data.selectiveTaxRate,
    vatCode: data.eInvoiceTaxCode,
    taxExemptionReason: data.eInvoiceExemptionReason,
    isScaleItem: data.isScaleItem
  });

  this.changeButtonState(data.id, true);
}

  selectFilterSearch(type: 'code' | 'name') {
    this.selectedSearchType = type;
    if (this.selectedSearchType == 'code') {
      this.selectedSearch = 'كود الصنف';
      this.SearchValEnum = SearchableColumnEnum.Code;

      // this.showSearchBox = false;
    } else {
      this.selectedSearch = 'اسم الصنف';
      this.SearchValEnum = SearchableColumnEnum.Name;
    }
    this.showSearchBox = false;
  }
  onEnter(event: any) {
    if (this.searchControl.invalid) {
      this._messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: `يجب ادخال قيمه بحث ${this.selectedSearch}`,
      });
      return;
    }
  }

  search(event: AutoCompleteCompleteEvent) {
    const query = (event.query ?? '').trim();
    if (!query) {
      this.items = [];
      return;
    }
    
    const payload = buildSearchPayload(query, this.pageSize, this.SearchValEnum);

    this._productServices
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
  onSelectProduct(event: any) {
    const delegateId = event.value.value;

    this._productServices
      .getById(delegateId)
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((res) => {
        console.log(res);
        this.idUpdate = res.data.id;

        this.productCards.clear();

        res.data.productCardDetails.forEach((card: any) => {
          const form = this.createProductCard();

          form.patchValue(card);

          this.productCards.push(form);
        });

        this.productForm.patchValue({
          code: res.data.code,
          nameAr: res.data.nameAr,
          nameEn: res.data.nameEn,
          productType: res.data.productTypeId,
          categoryId: res.data.categoryId,
          groupId: res.data.groupId,
          vat: res.data.vatRate,
          selectiveVat: res.data.selectiveTaxRate,
          vatCode: res.data.eInvoiceTaxCode,
          taxExemptionReason: res.data.eInvoiceExemptionReason,

          //  productCards: res.data.productCards
        });
        this.loadProduct(res.data);
        this.changeButtonState(res.data.id, true);
        // this.searchControl.setValue('');
        this.searchControl.reset();
        this.items = [];
      });
  }

  // *** Actions
  save() {
    console.log('Save action triggered');
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    if (this.productCards.length === 0) {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'يرجي اضافة وحدة واحدة علي الأقل',
      });
      return;
    }
    const body = this.productForm.getRawValue();
    body.isScaleItem = Boolean(body.isScaleItem);
    body.productCards = body.productCards.map((card: any) => ({
      ...card,
      id: 0,
      smallerUnitId: card.smallerUnitId === 0 ? null : card.smallerUnitId,
      conversionFactor: Number(card.conversionFactor),
      purchasePrice: Number(card.purchasePrice),
      retailPrice: Number(card.retailPrice),
      wholesalePrice: Number(card.wholesalePrice),
    }));

    if (this.isEditMode == false) {
      this._productServices
        .create(body)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((res: any) => {
          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'تم الحفظ بنجاح',
          });
          this.changeButtonState(res.data.id, true);
          this.productForm.get('code')?.setValue(res.data.code);
          this.refreshActions();
        });
    } else {
      console.log(body.productCards);
      // return;

      this._productServices
        .update(body, this.idUpdate)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((res: any) => {
          this._messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'تم التعديل بنجاح',
          });
          this.changeButtonState(res.data.id, true);
          // this.productForm.get('code')?.setValue(res.data.code);
          this.refreshActions();
        });
    }
  }
  reset() {
    console.log('Reset action triggered');
    this.productForm.reset({
      productType: this.typeProduct[0]?.id,
      categoryId: this.dataCategories[0]?.id,
      groupId: this.dataGroups[0]?.id,
      isScaleItem: true,
    });

    this.productCards.clear();
    this.idUpdate = 0;
    this.isEditMode = false;
      this._sharedStateServices.clearSelectedId();

    this.refreshActions();
  }

  delete() {
    // console.log('Delete action triggered');
    this.showDeleteDialog = true;
  }

  deleteDialog() {
      this._productServices.delete(this.idUpdate).pipe(takeUntilDestroyed(this._destroyRef)).subscribe({
        next:(res:any)=>{
          this._messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الحذف بنجاح',
          })
          this.reset();
          this.showDeleteDialog=false;
        }
      })
  }

  print() {
    console.log('Print action triggered');
  }
}
