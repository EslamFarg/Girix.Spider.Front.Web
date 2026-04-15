import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectFilterEvent, SelectLazyLoadEvent, SelectModule } from 'primeng/select';
import { CarouselModule } from 'primeng/carousel';
import { TextareaModule } from 'primeng/textarea';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { IProductCreateUnit, IProductReadResponse, IProductSearchRow, IProductUnit, ProductSearchEnum, ProductService } from '../../services/product-service';
import { FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupSearchEnum, GroupService, IGroupSearchRow } from '../../services/group-service';
import { ImgOnly } from '@/directives/img-only';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { Slider } from '@/components/slider/slider';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Dialog } from 'primeng/dialog';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { TranslatePipe } from '@ngx-translate/core';
import { NgLabelTemplateDirective, NgOptionTemplateDirective, NgSelectComponent } from '@ng-select/ng-select';
import { Debounce } from '@/directives/debounce';
import { ImgFallback } from '@/directives/img-fallback';
import { ControlsOf } from '@/yn-ng/types/helpers';
import { IUnitSearchRow, UnitSearchEnum, UnitService } from '../../services/unit-service';
import { RouterLink } from '@angular/router';

interface IProductUnitFormRow {
  unitId: number | null;
  quantity: number | null;
  isMainUnit: boolean | null;
}

type IProductUnitFormRowControls = ControlsOf<IProductUnitFormRow>;

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
    RouterLink,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm extends BaseComponent implements OnInit {
  formMode = computed(() => (this.existingProduct() ? FormMode.Update : this.initialFormMode()));

  initialProductFgValue = {
    nameEn: this.fb.control<string>('', [Validators.required]),
    nameAr: this.fb.control<string>('', [Validators.required, noSymbolsAllowed, Validators.minLength(3), Validators.maxLength(200)]),
    descriptionEn: this.fb.control<string>('', [Validators.required]),
    descriptionAr: this.fb.control<string>('', [Validators.required, Validators.minLength(3), Validators.maxLength(1000)]),
    price: this.fb.control<number | null>(0, [Validators.required, Validators.min(0)]),
    costPrice: this.fb.control<number | null>(0, [Validators.required, Validators.min(0)]),
    tax: this.fb.control<number | null>(0, [Validators.required]),
    selectiveTax: this.fb.control<number | null>(0, [Validators.required]),
    isAddition: this.fb.control<boolean | null>(false, [Validators.required]),
    idsAdditionMenuItem: this.fb.control<number[] | null>([], []),
    images: this.fb.control<File[] | { id: number; fullPath: string }[] | null>([], []),
    menuItemUnits: this.fb.array<FormGroup<IProductUnitFormRowControls>>([], [Validators.required, Validators.minLength(1)]),
    categoryId: this.fb.control<number | null>(null, [Validators.required]),
    id: this.fb.control<number>(0, []),
    imagesAdd: this.fb.control<File[]>([], []),
    listIdsOfDeleteImages: this.fb.control<number[]>([], []),
    allImages: this.fb.control<IFormImage[]>([], [Validators.required, Validators.minLength(1), Validators.maxLength(6)]),
  };

  productService = inject(ProductService);
  unitService = inject(UnitService);
  calculatePrice = this.productService.calculatePrice;
  productFg = this.fb.group(this.initialProductFgValue);
  existingProduct = signal<IProductReadResponse | null>(null);

  currentImage = signal<IFormImage | null>(null);
  existingImages = signal<IFormImage[]>([]);
  newImages = signal<IFormImage[]>([]);
  allImages = computed<IFormImage[]>(() => [
    ...this.existingImages().map((image, ix) => ({ ...image, fullPath: this.baseUrl + image.fullPath, ix })),
    ...this.newImages().map((image, ix) => ({ ...image, ix: ix + this.existingImages().length })),
  ]);

  isGroupsDialogVisible = signal(false);
  closeGroupsDialog = () => this.isGroupsDialogVisible.set(false);
  openGroupsDialog = () => this.isGroupsDialogVisible.set(true);

  groupService = inject(GroupService);
  currentGroup = signal<{ id: number; name: string } | null>(null);
  groups = signal<IGroupSearchRow[]>([]);
  displayedGroups = computed(() => {
    const current = this.currentGroup();
    const groups = this.groups();
    if (!current) return groups;
    return groups.some((g) => g.id === current.id) ? groups.map((g) => (g.id === current.id ? { ...g, ...current } : g)) : [current, ...groups];
  });
  groupsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };
  previousGroupsSearchTerm = '';

  currentAdditions = signal<{ id: number; name: string }[]>([]);
  additionProducts = signal<IProductSearchRow[]>([]);
  displayedAdditions = computed(() => {
    const current = this.currentAdditions();
    const products = this.additionProducts();
    if (!current.length) return products;
    const currentMap = new Map(current.map((a) => [a.id, a]));
    const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));
    const missing = current.filter((c) => !products.some((p) => p.id === c.id));
    return [...missing, ...merged];
  });
  additionPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };
  previousAdditionsSearchTerm = '';

  units = signal<IUnitSearchRow[]>([]);
  currentUnits = signal<Partial<IUnitSearchRow>[]>([]);
  displayedUnits = computed(() => {
    const current = this.currentUnits();
    const units = this.units();
    if (!current.length) return units;
    const currentMap = new Map(current.map((unit) => [unit.id, unit]));
    const merged = units.map((unit) => (currentMap.has(unit.id) ? { ...unit, ...currentMap.get(unit.id)! } : unit));
    const missing = current.filter((unit) => !units.some((existing) => existing.id === unit.id));
    return [...missing, ...merged] as IUnitSearchRow[];
  });
  unitsPaginationInfo: IPaginationInfo = { pageIndex: 1, totalPagesCount: 0, totalRowsCount: 0 };
  previousUnitsSearchTerm = '';
  isUnitsDialogVisible = signal(false);

  lastClickedTableRowIndex = signal<number | null>(null);
  currentEditRowIndex = signal<number>(-1);
  newProductUnitRowFg!: FormGroup<IProductUnitFormRowControls>;

  constructor() {
    super();
    effect(() => console.log(this.allImages()));
  }

  get productUnitRows() {
    return this.productFg.controls.menuItemUnits;
  }

  ngOnInit() {
    this.searchGroups({ pageIndex: 1 });
    this.searchAdditions({ pageIndex: 1 });
    this.searchUnits({ pageIndex: 1 });
    this.setUpNewProductUnitRowFg();

    this.productFg.get('isAddition')?.valueChanges.subscribe((isAddition) => {
      if (isAddition) {
        this.productFg.get('idsAdditionMenuItem')?.disable();
        this.productFg.get('idsAdditionMenuItem')?.patchValue([]);
      } else {
        this.productFg.get('idsAdditionMenuItem')?.enable();
      }
    });

    if (this.formMode() === FormMode.Update) {
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
        this.currentImage.set(product.images[0] ?? null);
        this.currentGroup.set({ id: product.categoryId, name: product.categoryName });
        this.currentAdditions.set(product.additionMenuItem);
      });

      this.productService.getUnitsByProductId(this.routeId).subscribe((units) => {
        this.currentUnits.set(units.map((unit) => ({ id: unit.unitId, nameAr: unit.unitName, nameEn: unit.unitName })));
        this.productFg.setControl(
          'menuItemUnits',
          this.fb.array(units.map((unit) => this.createProductUnitRowFg(this.mapProductUnitToFormRow(unit))), [Validators.required, Validators.minLength(1)]),
        );
      });
    }
  }

  onSubmitForm() {
    this.productFg.patchValue({
      nameEn: this.productFg.value.nameAr?.trim(),
      descriptionEn: this.productFg.value.descriptionAr?.trim(),
      images: this.newImages().map((image) => image.file!),
      allImages: [...this.allImages()],
      imagesAdd: this.newImages().map((image) => image.file!),
    });

    const product = {
      ...this.productFg.getRawValue(),
      menuItemUnits: this.productUnitRows.getRawValue() as IProductCreateUnit[],
    };

    if (this.productFg.invalid) {
      console.log('invalid');
      console.log(product);
      this.productFg.markAllAsTouched();
      return;
    }

    const formValues: { [key: string]: string | Blob } =
      this.formMode() === FormMode.Create
        ? omitKeys(product, ['id', 'imagesAdd', 'listIdsOfDeleteImages', 'allImages'])
        : omitKeys(product, ['images', 'allImages']);

    const formData = new FormData();
    Array.from(Object.entries(formValues)).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (key === 'menuItemUnits') {
          value.forEach((unit, ix) => {
            Object.entries(unit).forEach(([nestedKey, nestedValue]) => {
              formData.append(`menuItemUnits[${ix}][${nestedKey}]`, String(nestedValue));
            });
          });
        } else {
          value.forEach((val) => formData.append(key, val));
        }
      } else {
        formData.append(key, value);
      }
    });

    formData.set('price', this.calculatePrice(product as any, false).toString());

    (this.formMode() === FormMode.Create ? this.productService.create(formData) : this.productService.patch(formData)).subscribe({
      next: (res) => console.log(res),
    });
  }

  onImagesFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const futureLength = this.newImages().length + input.files.length;
      if (futureLength > 6) {
        this.messageService.add({
          severity: 'error',
          summary: '\u062e\u0637\u0627\u0654',
          detail: '\u0644\u0627 \u064a\u0645\u0643\u0646 \u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0643\u062b\u0631 \u0645\u0646 6 \u0635\u0648\u0631\u0629',
        });
        return;
      }
      const files = Array.from(input.files);
      this.newImages.update((prev) => [
        ...prev,
        ...files.map((file, ix) => ({ file, fullPath: URL.createObjectURL(file), id: 'new-image-' + Date.now() * Math.random(), ix })),
      ]);
      this.productFg.patchValue({ allImages: [...this.allImages()] });
      this.currentImage.set(this.allImages()[0] ?? null);
    }
    input.value = '';
  }

  onDeleteImage() {
    const isImageNew = this.newImages().some((i) => i.id === this.currentImage()?.id);
    if (isImageNew) this.newImages.update((images) => images.filter((i) => i.id !== this.currentImage()?.id));
    else {
      this.existingImages.update((images) => images.filter((i) => i.id !== this.currentImage()?.id));
      this.productFg.patchValue({ listIdsOfDeleteImages: [...this.productFg.value.listIdsOfDeleteImages!, this.currentImage()?.id as number] });
    }
    this.currentImage.set(this.allImages()[0] ?? null);
  }

  onSelectImage = (ix: number) => this.currentImage.set(this.allImages()[ix]);

  searchGroups(opts: { pageIndex: number; searchTerm?: string }) {
    this.groupService.search({
      paginationInfo: { pageIndex: opts.pageIndex, pageSize: 10 },
      searchFilters: [{ column: GroupSearchEnum.Name, values: [opts.searchTerm ?? ''] }],
      fromDate: this.dateNowIso,
    }).subscribe({
      next: (res) => {
        if (res.value.rows.length === 0) return;
        this.previousGroupsSearchTerm = opts.searchTerm ?? '';
        if (opts.pageIndex === 1) this.groups.set(res.value.rows);
        else this.groups.update((pre) => [...pre, ...res.value.rows]);
        this.groupsPaginationInfo = {
          pageIndex: opts.pageIndex,
          totalPagesCount: res.value.paginationInfo.totalPagesCount,
          totalRowsCount: res.value.paginationInfo.totalRowsCount,
        };
      },
    });
  }

  getNextGroupsPage(event: SelectLazyLoadEvent) {
    if (event.first === 0) return;
    if (event.last === this.groups().length) this.emitDebounceItem('searchGroups', { pageIndex: this.groupsPaginationInfo.pageIndex + 1, searchValue: '' });
  }

  onGroupsFilter(event: SelectFilterEvent) {
    this.debounceMap.get('searchGroups')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }

  onGroupsNameSearch(event: any, searchTerm: string = '') {
    if (searchTerm?.length > 100) return;
    this.searchGroups({ pageIndex: searchTerm !== this.previousGroupsSearchTerm ? 1 : this.groupsPaginationInfo.pageIndex + 1, searchTerm });
  }

  searchAdditions(opts: { pageIndex: number; searchTerm?: string }) {
    this.productService.search({
      paginationInfo: { pageIndex: opts.pageIndex, pageSize: 20 },
      searchFilters: [
        { column: ProductSearchEnum.IsAddition, values: ['true'] },
        { column: ProductSearchEnum.Name, values: [opts.searchTerm ?? ''] },
      ],
      fromDate: null,
      removeDateFilter: true,
    }).subscribe({
      next: (res) => {
        if (res.value.menuItems.rows.length === 0) return;
        this.previousAdditionsSearchTerm = opts.searchTerm ?? '';
        if (opts.pageIndex === 1) this.additionProducts.set(res.value.menuItems.rows);
        else this.additionProducts.update((prev) => prev.concat(res.value.menuItems.rows));
        this.additionPaginationInfo = {
          pageIndex: opts.pageIndex,
          totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
          totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
        };
      },
    });
  }

  getNextAdditionProductsPage(event: SelectLazyLoadEvent) {
    if (event.first === 0) return;
    if (event.last === this.additionProducts().length) this.emitDebounceItem('searchAdditionProducts', { pageIndex: this.additionPaginationInfo.pageIndex + 1, searchValue: '' });
  }

  onAdditionProductsFilter(event: any) {
    this.debounceMap.get('searchAdditionProducts')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }

  onAdditionProductsSearch(event: any, searchTerm: string = '') {
    if (searchTerm?.length > 100) return;
    this.searchAdditions({ pageIndex: searchTerm !== this.previousAdditionsSearchTerm ? 1 : this.additionPaginationInfo.pageIndex + 1, searchTerm });
  }

  searchUnits(opts: { pageIndex: number; searchTerm?: string }) {
    this.unitService.search({
      paginationInfo: { pageIndex: opts.pageIndex, pageSize: 20 },
      searchFilters: [{ column: UnitSearchEnum.Name, values: [opts.searchTerm ?? ''] }],
      fromDate: null,
    }).subscribe({
      next: (res) => {
        if (res.value.rows.length === 0) return;
        this.previousUnitsSearchTerm = opts.searchTerm ?? '';
        if (opts.pageIndex === 1) this.units.set(res.value.rows);
        else this.units.update((prev) => prev.concat(res.value.rows));
        this.unitsPaginationInfo = {
          pageIndex: opts.pageIndex,
          totalPagesCount: res.value.paginationInfo.totalPagesCount,
          totalRowsCount: res.value.paginationInfo.totalRowsCount,
        };
      },
    });
  }

  onUnitsSearch(event: any, searchTerm: string = '') {
    if (searchTerm?.length > 100) return;
    if (event?.type === 'scrollToEnd' && searchTerm === this.previousUnitsSearchTerm) this.searchUnits({ pageIndex: this.unitsPaginationInfo.pageIndex + 1, searchTerm });
    else this.searchUnits({ pageIndex: 1, searchTerm });
  }

  openUnitsDialog = () => this.isUnitsDialogVisible.set(true);
  closeUnitsDialog = () => this.isUnitsDialogVisible.set(false);

  editProductUnitRow(rowIndex: number) {
    this.lastClickedTableRowIndex.set(rowIndex + 1);
    this.currentEditRowIndex.set(rowIndex);
  }

  isRowEditable(rowIndex: number) {
    return this.currentEditRowIndex() === rowIndex;
  }

  deleteProductUnitRow(rowIndex: number) {
    this.productUnitRows.removeAt(rowIndex);
    this.currentEditRowIndex.set(-1);
    this.syncCurrentUnitsFromRows();
  }

  createProductUnitRowFg(data?: IProductUnitFormRow) {
    return this.fb.group<IProductUnitFormRowControls>({
      unitId: this.fb.control<number | null>(data?.unitId ?? null, [Validators.required]),
      quantity: this.fb.control<number | null>(data?.quantity ?? null, [Validators.required, Validators.min(1)]),
      isMainUnit: this.fb.control<boolean | null>(data?.isMainUnit ?? false, [Validators.required]),
    });
  }

  setUpNewProductUnitRowFg() {
    this.currentEditRowIndex.set(-1);
    if (this.newProductUnitRowFg) this.newProductUnitRowFg.reset({ unitId: null, quantity: null, isMainUnit: false });
    else this.newProductUnitRowFg = this.createProductUnitRowFg();
  }

  addProductUnitRow() {
    if (this.newProductUnitRowFg.invalid) {
      this.newProductUnitRowFg.markAllAsTouched();
      return;
    }

    const rowValue = this.newProductUnitRowFg.getRawValue();
    const editingRowIndex = this.currentEditRowIndex();

    if (this.productUnitRows.controls.some((row, index) => index !== editingRowIndex && row.controls.unitId.value === rowValue.unitId)) {
      this.messageService.add({
        severity: 'error',
        summary: '\u062e\u0637\u0627\u0654',
        detail: '\u0627\u0644\u0648\u062d\u062f\u0629 \u0627\u0644\u0645\u062d\u062f\u062f\u0629 \u0645\u0648\u062c\u0648\u062f\u0629 \u0628\u0627\u0644\u0641\u0639\u0644',
      });
      return;
    }

    if (rowValue.isMainUnit) {
      this.productUnitRows.controls.forEach((row, index) => {
        if (index !== editingRowIndex) row.controls.isMainUnit.setValue(false);
      });
    }

    if (editingRowIndex !== -1) {
      this.productUnitRows.at(editingRowIndex).patchValue(rowValue);
      this.lastClickedTableRowIndex.set(editingRowIndex);
    } else {
      this.productUnitRows.push(this.createProductUnitRowFg(rowValue));
      this.lastClickedTableRowIndex.set(this.productUnitRows.length - 1);
    }

    this.syncCurrentUnitsFromRows();
    this.setUpNewProductUnitRowFg();
  }

  editProductUnitFromDialog(rowIndex: number) {
    const row = this.productUnitRows.at(rowIndex);
    if (!row) return;
    this.newProductUnitRowFg.patchValue(row.getRawValue());
    this.editProductUnitRow(rowIndex);
    this.closeUnitsDialog();
  }

  deleteProductUnitFromDialog(rowIndex: number) {
    this.deleteProductUnitRow(rowIndex);
  }

  onProductUnitMainChange(changedRowIndex: number) {
    if (!this.productUnitRows.at(changedRowIndex)?.controls.isMainUnit.value) return;
    this.productUnitRows.controls.forEach((row, index) => {
      if (index !== changedRowIndex) row.controls.isMainUnit.setValue(false, { emitEvent: false });
    });
  }

  onCurrentProductUnitChange(unit: IUnitSearchRow | null) {
    if (!unit) return;
    this.newProductUnitRowFg.controls.unitId.setValue(unit.id);
    this.syncCurrentUnitsFromRows(unit);
  }

  onExistingProductUnitChange(unit: IUnitSearchRow | null) {
    if (unit) this.syncCurrentUnitsFromRows(unit);
  }

  getUnitDisplayName(unitId: number | null) {
    return this.displayedUnits().find((unit) => unit.id === unitId)?.nameAr ?? '';
  }

  mapProductUnitToFormRow(unit: IProductUnit): IProductUnitFormRow {
    return { unitId: unit.unitId, quantity: unit.quantity, isMainUnit: unit.isMainUnit };
  }

  syncCurrentUnitsFromRows(extraUnit?: Partial<IUnitSearchRow>) {
    const selected = this.productUnitRows.controls
      .map((row) => row.controls.unitId.value)
      .filter((unitId): unitId is number => unitId !== null)
      .map((unitId) => {
        const matched = this.displayedUnits().find((unit) => unit.id === unitId);
        return matched ? { id: matched.id, nameAr: matched.nameAr, nameEn: matched.nameEn } : { id: unitId, nameAr: '', nameEn: '' };
      });
    this.currentUnits.set(extraUnit?.id ? [...selected, extraUnit] : selected);
  }
}
