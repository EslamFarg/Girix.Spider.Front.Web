import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';

import { SelectModule } from 'primeng/select';
import { CarouselModule } from 'primeng/carousel';
import { TextareaModule } from 'primeng/textarea';
import { BaseComponent, FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { IProductCreateRequest, ProductService } from '../../services/product-service';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupSearchEnum, GroupService, IGroupRowResponse } from '../../services/group-service';
import { ImgOnly } from '@/directives/img-only';
import { omitKeys } from '@/lib/helpers';
import { Slider } from "@/components/slider/slider";

type ProductFgValue =
  | { [key in keyof IProductCreateRequest]: FormControl<IProductCreateRequest[key]> }
  | {
      images: FormControl<{ id: number; fullPath: string }[]>;
    };

interface IFormImage {
  id?: number;
  fullPath: string;
  file?: File;
}

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
    Slider
],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm extends BaseComponent implements OnInit {
  formMode = input.required<FormMode>();

  initialProductFgValue: ProductFgValue = {
    nameEn: this.fb.control<string>('', [Validators.required]),
    nameAr: this.fb.control<string>('', [Validators.required]),
    descriptionEn: this.fb.control<string>('', [Validators.required]),
    descriptionAr: this.fb.control<string>('', [Validators.required]),
    price: this.fb.control<number>(0, [Validators.required]),
    costPrice: this.fb.control<number>(0, [Validators.required]),
    tax: this.fb.control<number>(0, [Validators.required]),
    selectiveTax: this.fb.control<number>(0, [Validators.required]),
    //category = group
    categoryId: this.fb.control<number>(0, [Validators.required]),
    isAddition: this.fb.control<boolean>(false, [Validators.required]),
    idsAdditionMenuItem: this.fb.control<number[]>([], [Validators.required]),
    images: this.fb.control<File[] & { id: number; fullPath: string }[]>([], [Validators.required]),
    //@ts-ignore
    //update only props
    id: this.fb.control<number>(0, [Validators.required]),
    imagesAdd: this.fb.control<File[]>([], [Validators.required]),
    listIdsOfDeleteImages: this.fb.control<number[]>([], [Validators.required]),
  };

  productService = inject(ProductService);
  productFg = this.fb.group(this.initialProductFgValue);

  ngOnInit() {
    this.searchGroups(1);

    switch (this.formMode()) {
      case FormMode.Update:
        this.productService.getById(this.routeId).subscribe((product) => {
          this.productFg.patchValue(product);
          this.existingImages.set(product.images);
        });
        break;
      default:
        break;
    }
  }

  onSubmitForm() {
    let formValue;
    switch (this.formMode()) {
      case FormMode.Create:
        formValue = omitKeys(this.productFg.value, ['ImagesAdd', 'ListIdsOfDeleteImages']);
        break;
      case FormMode.Update:
        formValue = omitKeys(this.productFg.value, ['Images']);
        break;
      default:
        break;
    }
  }

  //
  //
  //
  //
  existingImages = signal<IFormImage[]>([]);
  newImages = signal<IFormImage[]>([]);
  allImages = computed<IFormImage[]>(() => [
    ...this.existingImages().map((image) => ({ ...image, fullPath: this.baseUrl + image.fullPath })),
    ...this.newImages(),
  ]);
  onImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach((file) => {
        this.newImages.update((images) => [...images, { file, fullPath: URL.createObjectURL(file) }]);
      });
    }

    input.value = '';
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
  groupService = inject(GroupService);
  groups = signal<IGroupRowResponse[]>([]);
  groupsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchGroups(pageIndex: number) {
    this.groupService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: GroupSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: this.dateNowIso,
      })
      .subscribe({
        next: (res) => {
          this.groups.set(res.value.rows);
          this.groupsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }
}
