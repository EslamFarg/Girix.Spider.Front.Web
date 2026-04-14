import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectFilterEvent, SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { CarouselModule } from 'primeng/carousel';
import { TextareaModule } from 'primeng/textarea';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import {
  IProductCreateRequest,
  IProductCreateUnit,
  IProductReadResponse,
  IProductSearchRow,
  ProductSearchEnum,
  ProductService,
} from '../../services/product-service';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupSearchEnum, GroupService, IGroupSearchRow } from '../../services/group-service';
import { ImgOnly } from '@/directives/img-only';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { Slider } from '@/components/slider/slider';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Dialog } from 'primeng/dialog';
import { BehaviorSubject, debounce, debounceTime, Subject, tap } from 'rxjs';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { TranslatePipe } from '@ngx-translate/core';
import { NgSelectComponent, NgOptionTemplateDirective, NgLabelTemplateDirective } from '@ng-select/ng-select';
import { Debounce } from '@/directives/debounce';
import { ImgFallback } from '@/directives/img-fallback';
import { ControlsOf } from '@/yn-ng/types/helpers';

@Component({
  selector: 'app-product-form',
  imports: [
    Button,
    InputErrorMessageHandler,
    InputTextModule,
    SelectModule,
    CarouselModule,
    TextareaModule,
    ReactiveFormsModule,
    ImgOnly,
    Slider,
    ButtonDirective,
    InputGroupAddon,
    Dialog,
    MultiSelectModule,
    AllowNumbers,
    TranslatePipe,
    NgSelectComponent,
    Debounce,
    FormsModule,
    ImgFallback,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm extends BaseComponent implements OnInit {
  formMode = computed(() => {
    if (this.existingProduct()) return FormMode.Update;
    return this.initialFormMode();
  });

  initialProductFgValue = {
    nameEn: this.fb.control<string>('', [Validators.required]),
    nameAr: this.fb.control<string>('', [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    descriptionEn: this.fb.control<string>('', [Validators.required]),
    descriptionAr: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(1000),
    ]),
    price: this.fb.control<number|null>(0, [Validators.required, Validators.min(0)]),
    costPrice: this.fb.control<number|null>(0, [Validators.required, Validators.min(0)]),
    tax: this.fb.control<number|null>(0, [Validators.required]),
    selectiveTax: this.fb.control<number|null>(0, [Validators.required]),
    //category = group
    isAddition: this.fb.control<boolean | null>(false, [Validators.required]),
    idsAdditionMenuItem: this.fb.control<number[]|null>([], []),
    images: this.fb.control<File[] | { id: number; fullPath: string }[] |null>([], []),
    menuItemUnits: this.fb.array<FormGroup<ControlsOf<IProductCreateUnit>> |null>([]),
    //ts ignore to allow null for now
    categoryId: this.fb.control<number | null>(null, [Validators.required]),
    //
    //
    //update only props
    id: this.fb.control<number>(0, []),
    imagesAdd: this.fb.control<File[]>([], []),
    listIdsOfDeleteImages: this.fb.control<number[]>([], []),
    //
    //
    //for validation message only
    allImages: this.fb.control<IFormImage[]>(
      [],
      [Validators.required, Validators.minLength(1), Validators.maxLength(6)],
    ),

  };

  productService = inject(ProductService);
  calculatePrice = this.productService.calculatePrice;
  productFg = this.fb.group(this.initialProductFgValue);
  existingProduct = signal<IProductReadResponse | null>(null);
  // productFgListener = this.productFg.valueChanges.subscribe((value) => {
  //   const finalPriceWithTax = this.calculatePrice(
  //     {
  //       price: value.price ?? 0,
  //       taxPercentage: value.tax ?? 0 / 100,
  //       selectedTaxPercentage: value.selectiveTax ?? 0 / 100,
  //     },
  //     false,
  //   );
  //   this.productFg.patchValue({ price: finalPriceWithTax }, { emitEvent: false });
  // });

  /**
   *
   */
  constructor() {
    super();
    effect(() => {
      console.log(this.allImages());
    });
  }

  ngOnInit() {
    this.searchGroups({ pageIndex: 1 });
    this.searchAdditions({ pageIndex: 1 });

    this.productFg.get('isAddition')?.valueChanges.subscribe((isAddition) => {
      if (isAddition) {
        this.productFg.get('idsAdditionMenuItem')?.disable();
        this.productFg.get('idsAdditionMenuItem')?.patchValue([]);
      } else {
        this.productFg.get('idsAdditionMenuItem')?.enable();
      }
    });

    switch (this.formMode()) {
      case FormMode.Update:
        this.productService.getById(this.routeId).subscribe((product) => {
          this.existingProduct.set(product);
          this.productFg.patchValue({
            ...product,
            nameAr: product.name,
            nameEn: product.name,
            descriptionAr: product.description,
            descriptionEn: product.description,
            price: this.calculatePrice(product, true),
            idsAdditionMenuItem: product.additionMenuItem.map((item) => item.id),
          });
          this.existingImages.set(product.images);
          this.currentImage.set(product.images[0]);
          this.currentGroup.set({ id: product.categoryId, name: product.categoryName });
          this.currentAdditions.set(product.additionMenuItem);
        });
        break;
      default:
        break;
    }

    // this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchGroups', (e) =>
    //   this.searchGroups(e.pageIndex, e.searchValue),
    // );
    // this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchAdditionProducts', (e) =>
    //   this.searchAdditions(e.pageIndex, e.searchValue),
    // );
  }

  onSubmitForm() {
    const productFg = this.productFg;
    productFg.patchValue({
      nameEn: productFg.value.nameAr?.trim(),
      descriptionEn: productFg.value.descriptionAr?.trim(),
      images: this.newImages().map((image) => image.file!),
      allImages: [...this.allImages()],
      imagesAdd: this.newImages().map((image) => image.file!),
    });
    const product = productFg.value;
    if (this.productFg.invalid) {
      console.log('invalid');
      console.log(product);
      this.productFg.markAllAsTouched();
      return;
    }
    console.log(product);

    let formValues: { [key: string]: string | Blob } = {};

    switch (this.formMode()) {
      case FormMode.Create:
        formValues = omitKeys(product, ['id', 'imagesAdd', 'listIdsOfDeleteImages', 'allImages']);
        break;
      case FormMode.Update:
        formValues = omitKeys(product, ['images', 'allImages']);
        break;
    }
    const formData = new FormData();

    Array.from(Object.entries(formValues)).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => formData.append(key, val));
      } else {
        formData.append(key, value);
      }
    });

    formData.set('price', this.calculatePrice(product as any, false).toString());
    switch (this.formMode()) {
      case FormMode.Create:
        this.productService.create(formData).subscribe({
          next: (res) => {
            console.log(res);
          },
        });
        break;
      case FormMode.Update:
        this.productService.patch(formData).subscribe({
          next: (res) => {
            console.log(res);
          },
        });
        break;
    }
  }
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //images
  //
  //
  currentImage = signal<IFormImage | null>(null);
  existingImages = signal<IFormImage[]>([]);
  newImages = signal<IFormImage[]>([]);
  allImages = computed<IFormImage[]>(() => [
    ...this.existingImages().map((image, ix) => ({ ...image, fullPath: this.baseUrl + image.fullPath, ix })),
    ...this.newImages().map((image, ix) => ({ ...image, ix: ix + this.existingImages().length })),
  ]);
  onImagesFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const futureLength = this.newImages().length + input.files.length;
      if (futureLength > 6) {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يمكن اختيار اكثر من 6 صورة' });
        return;
      }
      const files = Array.from(input.files);
      // .forEach((file, ix) => {
      //   const randomKey = Date.now() * Math.random();

      // });
      this.newImages.update((prevImages) => [
        ...prevImages,
        ...files.map((file, ix) => ({
          file,
          fullPath: URL.createObjectURL(file),
          id: 'new-image-' + Date.now() * Math.random(),
          ix,
        })),
      ]);
      this.productFg.patchValue({
        allImages: [...this.allImages()],
      });
      this.currentImage.set(this.allImages()[0]);
    }

    input.value = '';
  }
  onDeleteImage() {
    const isImageNew = this.newImages().some((i) => i.id === this.currentImage()?.id);
    if (isImageNew) {
      this.newImages.update((images) => images.filter((i) => i.id !== this.currentImage()?.id));
    } else {
      this.existingImages.update((images) => images.filter((i) => i.id !== this.currentImage()?.id));
      this.productFg.patchValue({
        listIdsOfDeleteImages: [...this.productFg.value.listIdsOfDeleteImages!, this.currentImage()?.id],
      });
    }
    this.currentImage.set(this.allImages()[0]);
  }

  onSelectImage = (ix: number) => this.currentImage.set(this.allImages()[ix]);

  //
  //
  //
  //
  //
  //
  //groups
  //
  //
  //
  isGroupsDialogVisible = signal(false);
  closeGroupsDialog = () => this.isGroupsDialogVisible.set(false);
  openGroupsDialog = () => this.isGroupsDialogVisible.set(true);
  groupService = inject(GroupService);
  currentGroup = signal<{ id: number; name: string } | null>(null);
  groups = signal<IGroupSearchRow[]>([]);
  displayedGroups = computed(() => {
    const groups = this.groups();
    const current = this.currentGroup();

    if (!current) return groups;

    const exists = groups.some((g) => g.id === current.id);

    if (exists) {
      return groups.map((g) => (g.id === current.id ? { ...g, ...current } : g));
    }

    return [current, ...groups];
  });
  groupsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousGroupsSearchTerm = '';
  searchGroups(opts: { pageIndex: number; searchTerm?: string }) {
    this.groupService
      .search({
        paginationInfo: {
          pageIndex: opts.pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: GroupSearchEnum.Name,
            values: [opts.searchTerm ?? ''],
          },
        ],
        fromDate: this.dateNowIso,
      })
      .subscribe({
        next: (res) => {
          console.log(res.value.rows);
          if (res.value.rows.length === 0) return;
          this.previousGroupsSearchTerm = opts.searchTerm ?? '';
          if (opts.pageIndex === 1) {
            this.groups.set(res.value.rows);
          } else {
            this.groups.update((pre) => [...pre, ...res.value.rows]);
          }
          this.groupsPaginationInfo = {
            pageIndex: opts.pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  getNextGroupsPage(event: SelectLazyLoadEvent) {
    console.log(event.last);
    if (event.first === 0) return;
    if (event.last === this.groups().length) {
      this.emitDebounceItem('searchGroups', { pageIndex: this.groupsPaginationInfo.pageIndex + 1, searchValue: '' });
    }
  }
  onGroupsFilter(event: SelectFilterEvent) {
    this.debounceMap.get('searchGroups')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }

  onGroupsNameSearch(event: any, searchTerm: string = '') {
    const isNewSearchTerm = searchTerm != this.previousGroupsSearchTerm;

    if (searchTerm?.length > 100) return;

    if (isNewSearchTerm) {
      this.searchGroups({ pageIndex: 1, searchTerm });
    } else {
      this.searchGroups({ pageIndex: this.groupsPaginationInfo.pageIndex + 1, searchTerm });
    }
  }
  //
  //
  //
  //
  //
  //
  //additions
  //
  //
  //
  currentAdditions = signal<{ id: number; name: string }[]>([]);
  additionProducts = signal<IProductSearchRow[]>([]);
  displayedAdditions = computed(() => {
    const current = this.currentAdditions();
    const products = this.additionProducts();

    if (!current.length) return products;

    const currentMap = new Map(current.map((a) => [a.id, a]));

    // Replace matching ones, keep the rest
    const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !products.some((p) => p.id === c.id));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });
  additionPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  previousAdditionsSearchTerm = '';
  searchAdditions(opts: { pageIndex: number; searchTerm?: string }) {
    this.productService
      .search({
        paginationInfo: {
          pageIndex: opts.pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: ProductSearchEnum.IsAddition,
            values: ['true'],
          },
          {
            column: ProductSearchEnum.Name,
            values: [opts.searchTerm ?? ''],
          },
        ],
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          if (res.value.menuItems.rows.length > 0) {
            this.previousAdditionsSearchTerm = opts.searchTerm ?? '';
            if (opts.pageIndex === 1) {
              this.additionProducts.set(res.value.menuItems.rows);
            } else {
              this.additionProducts.update((prev) => prev.concat(res.value.menuItems.rows));
            }
            this.additionPaginationInfo = {
              pageIndex: opts.pageIndex,
              totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  getNextAdditionProductsPage(event: SelectLazyLoadEvent) {
    console.log(event.last);
    if (event.first === 0) return;
    if (event.last === this.additionProducts().length) {
      this.emitDebounceItem('searchAdditionProducts', {
        pageIndex: this.additionPaginationInfo.pageIndex + 1,
        searchValue: '',
      });
    }
  }
  onAdditionProductsFilter(event: any) {
    this.debounceMap.get('searchAdditionProducts')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }
  onAdditionProductsSearch(event: any, searchTerm: string = '') {
    const isNewSearchTerm = searchTerm != this.previousAdditionsSearchTerm;

    if (searchTerm?.length > 100) return;

    if (isNewSearchTerm) {
      this.searchAdditions({ pageIndex: 1, searchTerm });
    } else {
      this.searchAdditions({ pageIndex: this.groupsPaginationInfo.pageIndex + 1, searchTerm });
    }
  }
   //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //units dynamic form
    //
  
    lastClickedTableRowIndex = signal<number | null>(null);
  
    currentEditRowIndex = signal<number>(-1);
  
    editJournalDetailRow(rowIndex: number) {
      this.lastClickedTableRowIndex.set(rowIndex + 1);
      this.currentEditRowIndex.set(rowIndex);
    }
    isRowEditable(rowIndex: number) {
      return this.currentEditRowIndex() === rowIndex;
    }
    delteJournalDetailRow(rowIndex: number) {
      this.productFg.controls.menuItemUnits.removeAt(rowIndex);
      this.currentEditRowIndex.set(-1);
    }

    newJournalDetailsItemFg!: FormGroup<IAppJournalItemControls>;
  
    createNewJournalDetailsItemFg(data?: IAppJournalItem) {
      const fg = this.fb.group<IAppJournalItemControls>({
        creditorAmount: this.fb.control<number>(data?.creditorAmount ?? 0, [Validators.required]),
        debtorAmount: this.fb.control<number>(data?.debtorAmount ?? 0, [Validators.required]),
        notes: this.fb.control<string | null>(data?.notes ?? null, [Validators.required, Validators.maxLength(1000)]),
        finincalAccountId: this.fb.control<number | null>(data?.finincalAccountId ?? null, [Validators.required]),
      });
  
      const creditorAmountControl = fg.controls.creditorAmount;
      const debtorAmountControl = fg.controls.debtorAmount;
  
      creditorAmountControl.valueChanges.subscribe((creditorAmount) => {
        debtorAmountControl.setValue(0, { emitEvent: false });
      });
      debtorAmountControl.valueChanges.subscribe((debtorAmount) => {
        creditorAmountControl.setValue(0, { emitEvent: false });
      });
  
      return fg;
    }
  
    setUpNewJournalDetailsRowFg() {
      if (this.newJournalDetailsItemFg) {
        this.newJournalDetailsItemFg.reset();
      } else {
        this.newJournalDetailsItemFg = this.createNewJournalDetailsItemFg();
      }
    }
  
    submitNewJournalDetailsItem() {
      if (this.newJournalDetailsItemFg.invalid) {
        this.newJournalDetailsItemFg.markAllAsTouched();
        //log errors
        Object.entries(this.newJournalDetailsItemFg.controls!).forEach(([key, value]) => {
          if (value.errors) {
            console.log(key, value.errors);
          }
        });
        return;
      }
  
      const debitorAmount = this.newJournalDetailsItemFg.value.debtorAmount ?? 0;
      const creditorAmount = this.newJournalDetailsItemFg.value.creditorAmount ?? 0;
      if (debitorAmount == 0 && creditorAmount == 0) {
        this.newJournalDetailsItemFg.markAllAsTouched();
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب ادخال قيمة المدين او الدائن' });
        return;
      }
  
      const fgValue = this.newJournalDetailsItemFg.value;
  
      this.fg.controls.items!.push(this.createNewJournalDetailsItemFg(fgValue as IAppJournalItem));
  
      this.lastClickedTableRowIndex.set(this.fg.value.items!.length - 1);
      this.setUpNewJournalDetailsRowFg();
    }
}
