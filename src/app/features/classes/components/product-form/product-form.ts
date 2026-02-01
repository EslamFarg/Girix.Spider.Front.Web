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
  IProductSearchRow,
  ProductSearchEnum,
  ProductService,
} from '../../services/product-service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupSearchEnum, GroupService, IGroupSearchRow } from '../../services/group-service';
import { ImgOnly } from '@/directives/img-only';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { Slider } from '@/components/slider/slider';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Dialog } from 'primeng/dialog';
import { BehaviorSubject, debounce, debounceTime, Subject, tap } from 'rxjs';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { ProductFgControls } from './types';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';

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
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm extends BaseComponent implements OnInit {
  formMode = input.required<FormMode>();

  initialProductFgValue: ProductFgControls = {
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
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    price: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
    costPrice: this.fb.control<number>(0, [Validators.required, Validators.min(0)]),
    tax: this.fb.control<number>(0, [Validators.required]),
    selectiveTax: this.fb.control<number>(0, [Validators.required]),
    //category = group
    isAddition: this.fb.control<boolean>(false, [Validators.required]),
    idsAdditionMenuItem: this.fb.control<number[]>([], []),
    images: this.fb.control<File[] & { id: number; fullPath: string }[]>([], []),
    //@ts-ignore
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
  productFg = this.fb.group(this.initialProductFgValue);
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
    this.searchGroups(1);
    this.searchAdditions(1);

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
          this.productFg.patchValue({
            ...product,
            nameAr: product.name,
            nameEn: product.name,
            descriptionAr: product.description,
            descriptionEn: product.description,
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

    this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchGroups', (e) =>
      this.searchGroups(e.pageIndex, e.searchValue),
    );
    this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchAdditionProducts', (e) =>
      this.searchAdditions(e.pageIndex, e.searchValue),
    );
  }

  onSubmitForm() {
    this.productFg.patchValue({
      nameEn: this.productFg.value.nameAr?.trim(),
      descriptionEn: this.productFg.value.descriptionAr?.trim(),
      images: this.newImages().map((image) => image.file!),
      allImages: [...this.allImages()],
    });
    if (this.productFg.invalid) {
      console.log('invalid');
      console.log(this.productFg.value);
      this.productFg.markAllAsTouched();
      return;
    }

    let formValues: { [key: string]: string | Blob } = {};

    switch (this.formMode()) {
      case FormMode.Create:
        formValues = omitKeys(this.productFg.value, ['id', 'imagesAdd', 'listIdsOfDeleteImages', 'allImages']);
        break;
      case FormMode.Update:
        formValues = omitKeys(this.productFg.value, ['images', 'allImages']);
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
      Array.from(input.files).forEach((file, ix) => {
        const randomKey = Date.now() * Math.random();
        this.newImages.update((images) => [
          ...images,
          { file, fullPath: URL.createObjectURL(file), id: 'new-image-' + randomKey, ix },
        ]);
      });
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

  searchGroups(pageIndex: number, searchValue: string = '') {
    this.groupService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: GroupSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: this.dateNowIso,
      })
      .subscribe({
        next: (res) => {
          console.log(res.value.rows);
          if (res.value.rows.length === 0) return;
          if (pageIndex === 1) {
            this.groups.set(res.value.rows);
          } else {
            this.groups.update((pre) => [...pre, ...res.value.rows]);
          }
          this.groupsPaginationInfo = {
            pageIndex,
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
  searchAdditions(pageIndex: number, searchValue: string = '') {
    this.productService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
          {
            column: ProductSearchEnum.IsAddition,
            values: ['true'],
          },
          {
            column: ProductSearchEnum.Name,
            values: [searchValue],
          },
        ],
        fromDate: null,
        removeDateFilter: true,
      })
      .subscribe({
        next: (res) => {
          if (res.value.menuItems.rows.length > 0) {
            if (pageIndex === 1) {
              this.additionProducts.set(res.value.menuItems.rows);
            } else {
              this.additionProducts.update((prev) => prev.concat(res.value.menuItems.rows));
            }
            this.additionPaginationInfo = {
              pageIndex,
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
  onAdditionProductsFilter(event: SelectFilterEvent) {
    this.debounceMap.get('searchAdditionProducts')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }
}
