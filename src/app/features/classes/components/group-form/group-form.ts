import { FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { BaseComponent } from '@/components/base-component/base-component';
import { Button } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { GroupService } from '../../services/group-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IGroupFgControls } from './types';
import { Validators } from '@angular/forms';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { IPrinterSearchRow, PrinterSearchEnum, PrinterService } from '@/features/settings/services/printer-service';

@Component({
  selector: 'app-group-form',
  imports: [
    Button,
    InputErrorMessageHandler,
    InputText,
    SelectModule,
    CarouselModule,
    TextareaModule,
    NgSelectComponent,
  ],
  templateUrl: './group-form.html',
  styleUrl: './group-form.css',
})
export class GroupForm extends BaseComponent implements OnInit {
  formMode = input.required<FormMode>();

  initialGroupFgValue: IGroupFgControls = {
    nameEn: this.fb.control<string>('', [Validators.required]),
    nameAr: this.fb.control<string>('', [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    isOnCasher: this.fb.control(false, []),
    printerId: this.fb.control(null, [Validators.required]),
    images: this.fb.control([], []),
    //
    //
    //update only props
    id: this.fb.control(null, []),
    // imagesAdd: this.fb.control<File[]>([], []),
    // listIdsOfDeleteImages: this.fb.control<number[]>([], []),
    //
    //
    //for validation message only
    // allImages: this.fb.control<IFormImage[]>(
    //   [],
    //   [Validators.required, Validators.minLength(1), Validators.maxLength(6)],
    // ),
  };

  groupService = inject(GroupService);
  groupFg = this.fb.group(this.initialGroupFgValue);
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
    this.searchPrinters(1);

    switch (this.formMode()) {
      case FormMode.Update:
        this.groupService.getById(this.routeId).subscribe((group) => {
          this.groupFg.patchValue({
            ...group,
          });
          this.existingImages.set(group.images);
          this.currentImage.set(group.images[0]);
        });
        break;
      default:
        break;
    }

    this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchGroups', (e) =>
      this.searchPrinters(e.pageIndex, e.searchValue),
    );
  }

  onSubmitForm() {
    this.groupFg.patchValue({
      nameEn: this.groupFg.value.nameAr?.trim(),
      // images: this.newImages().map((image) => image.file!),
      // allImages: [...this.allImages()],
    });
    if (this.groupFg.invalid) {
      console.log('invalid');
      console.log(this.groupFg.value);
      this.groupFg.markAllAsTouched();
      return;
    }

    let formValues: { [key: string]: string | Blob } = {};

    switch (this.formMode()) {
      case FormMode.Create:
        formValues = omitKeys(this.groupFg.value, ['id', 'imagesAdd', 'listIdsOfDeleteImages', 'allImages']);
        break;
      case FormMode.Update:
        formValues = omitKeys(this.groupFg.value, ['images', 'allImages']);
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
        this.groupService.create(formData).subscribe({
          next: (res) => {
            console.log(res);
          },
        });
        break;
      case FormMode.Update:
        this.groupService.patch(formData).subscribe({
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
      // this.groupFg.patchValue({
      //   allImages: [...this.allImages()],
      // });
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
  //printers
  //
  //
  //
  currentPrinter = signal<{ id: number; name: string } | null>(null);
  printers = signal<IPrinterSearchRow[]>([]);
  printerService = inject(PrinterService);
  displayedPrinters = computed(() => {
    const printers = this.printers();
    const current = this.currentPrinter();

    if (!current) return printers;

    const exists = printers.some((g) => g.id === current.id);

    if (exists) {
      return printers.map((g) => (g.id === current.id ? { ...g, ...current } : g));
    }

    return [current, ...printers];
  });
  printersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchPrinters(pageIndex: number, searchValue: string = '') {
    this.printerService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: PrinterSearchEnum.Name,
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
            this.printers.set(res.value.rows);
          } else {
            this.printers.update((pre) => [...pre, ...res.value.rows]);
          }
          this.printersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.value.paginationInfo.totalPagesCount,
            totalRowsCount: res.value.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  getNextPrintersPage(event: any) {
    // console.log(event.last);
    // if (event.first === 0) return;
    // if (event.last === this.printers().length) {
    //   this.emitDebounceItem('searchPrinters', { pageIndex: this.printersPaginationInfo.pageIndex + 1, searchValue: '' });
    // }
  }
  onPrintersFilter(event: any) {
    // this.debounceMap.get('searchPrinters')?.subject.next({ pageIndex: 1, searchValue: event.filter });
  }
}
