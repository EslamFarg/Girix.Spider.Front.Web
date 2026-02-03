import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { IMealFgControls } from './types';
import { MealService } from '../../services/meal-service';
import { GroupSearchEnum, GroupService, IGroupSearchRow } from '../../services/group-service';
import { IProductSearchRow, ProductSearchEnum, ProductService } from '../../services/product-service';
import { Slider } from '@/components/slider/slider';
import { NgSelectComponent, NgOptionTemplateDirective, NgLabelTemplateDirective } from '@ng-select/ng-select';
import { Debounce } from '@/directives/debounce';
import { ImgFallback } from "@/directives/img-fallback";

@Component({
  selector: 'app-meal-form',
  imports: [
    Button,
    InputErrorMessageHandler,
    InputText,
    SelectModule,
    CarouselModule,
    TextareaModule,
    Slider,
    NgSelectComponent,
    Debounce,
    ButtonDirective,
    ImgFallback,
    NgOptionTemplateDirective,
    NgLabelTemplateDirective,FormsModule
],
  templateUrl: './meal-form.html',
  styleUrl: './meal-form.css',
})
export class MealForm extends BaseComponent implements OnInit {
  formMode = input.required<FormMode>();

  initialMealFgValue: IMealFgControls = {
    nameEn: this.fb.control(null, [Validators.required]),
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    descriptionEn: this.fb.control(null, [Validators.required]),
    descriptionAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    price: this.fb.control(0, [Validators.required, Validators.min(0)]),
    costPrice: this.fb.control(0, [Validators.required, Validators.min(0)]),
    tax: this.fb.control(0, [Validators.required]),
    selectiveTax: this.fb.control(0, [Validators.required]),
    //category = group
    images: this.fb.control([], []),
    //@ts-ignore
    //ts ignore to allow null for now
    categoryId: this.fb.control(null, [Validators.required]),
    menuItems: this.fb.control([], []),
    //
    //
    //update only props
    id: this.fb.control(0, []),
    imagesAdd: this.fb.control([], []),
    ListIdsOfDeleteImages: this.fb.control([], []),
    //
    //
    //for validation message only
    allImages: this.fb.control([], [Validators.required, Validators.minLength(1), Validators.maxLength(6)]),
  };

  mealService = inject(MealService);
  productFg = this.fb.group(this.initialMealFgValue);
  /**
   *
   */
  constructor() {
    super();
  }

  ngOnInit() {
    this.searchGroups(1);
    this.searchProducts(1);
    
    switch (this.formMode()) {
      case FormMode.Update:
        this.mealService.getById(this.routeId).subscribe((product) => {
          this.productFg.patchValue({
            ...product,
            images: [],
          });
          this.existingImages.set(product.images);
          this.currentImage.set(product.images[0]);
          this.currentProducts.set(product.menuItems);
          this.currentGroup.set({ id: product.categoryId, name: product.categoryName });
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
  previousGroupsSearchValue = '';
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
  debouncedGroupsSearch(event: any) {
    const searchValue = event?.term ?? '';
    if (this.previousGroupsSearchValue === searchValue) {
      this.searchProducts(this.productsPaginationInfo.pageIndex + 1, searchValue);
    } else {
      this.searchProducts(1, searchValue);
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
  currentProducts = signal<{ id: number; name: string }[]>([]);
  products = signal<IProductSearchRow[]>([]);
  productService = inject(ProductService);
  previousProductsSearchValue = '';
  displayedProducts = computed(() => {
    const current = this.currentProducts();
    const products = this.products();

    if (!current.length) return products;

    const currentMap = new Map(current.map((a) => [a.id, a]));

    // Replace matching ones, keep the rest
    const merged = products.map((p) => (currentMap.has(p.id) ? { ...p, ...currentMap.get(p.id)! } : p));

    // Inject ones not present in current page
    const missing = current.filter((c) => !products.some((p) => p.id === c.id));

    // Usually best UX: current selections first
    return [...missing, ...merged];
  });
  productsPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchProducts(pageIndex: number, searchValue: string = '') {
    this.productService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 20,
        },
        searchFilters: [
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
              this.products.set(res.value.menuItems.rows);
            } else {
              this.products.update((prev) => prev.concat(res.value.menuItems.rows));
            }
            this.productsPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.menuItems.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.menuItems.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }
  debouncedProductsSearch(event: any) {
    const searchValue = event?.term ?? '';
    if (this.previousProductsSearchValue === searchValue) {
      this.searchProducts(this.productsPaginationInfo.pageIndex + 1, searchValue);
    } else {
      this.searchProducts(1, searchValue);
    }
  }
}
