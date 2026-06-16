import { FormMode, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { BaseComponent } from '@/components/base-component/base-component';
import { ButtonDirective } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { GroupService, IGroupReadResponse } from '../../services/group-service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { IGroupFgControls } from './types';
import { ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { PrinterSearchEnum, PrinterService } from '@/features/printers';
import { Debounce } from '@/directives/debounce';
import { ImgFallback } from '@/directives/img-fallback';
import { TranslatePipe } from '@ngx-translate/core';
import { IPrinterSearchRow } from '@/features/printers';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';

@Component({
    selector: 'app-group-form',
    imports: [
        InputErrorMessageHandler,
        InputText,
        SelectModule,
        CarouselModule,
        TextareaModule,
        NgSelectComponent,
        Debounce,
        ButtonDirective,
        ImgFallback,
        TranslatePipe,
        ɵInternalFormsSharedModule,
        ReactiveFormsModule,
        LoadingDisabledDirective,
    ],
    templateUrl: './group-form.html',
    styleUrl: './group-form.css',
})
export class GroupForm extends BaseComponent implements OnInit {
    id = input.required<number>();
    formMode = computed(() => {
        if (this.existingGroup()) return FormMode.Update;
        return this.initialFormMode();
    });

    initialGroupFgValue: IGroupFgControls = {
        nameEn: this.fb.control<string>('', [Validators.required]),
        nameAr: this.fb.control<string>('', [
            Validators.required,
            noSymbolsAllowed,
            Validators.minLength(2),
            Validators.maxLength(200),
        ]),
        isOnCasher: this.fb.control(false, []),
        printerId: this.fb.control(null, [Validators.required]),
        description: this.fb.control<string>('', []),
        images: this.fb.control<File[]>([], []),
        //
        //
        //update only props
        id: this.fb.control(null, []),
        imagesAdd: this.fb.control([], []),
        listIdsOfDeleteImages: this.fb.control<number[]>([], []),
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
    existingGroup = signal<IGroupReadResponse | null>(null);
    /**
     *
     */
    constructor() {
        super();
    }

    ngOnInit() {
        this.searchPrinters(1);

        switch (this.formMode()) {
            case FormMode.Update:
                this.groupService.getById(this.id()).subscribe({
                    next: (group) => {
                        this.existingGroup.set(group);
                        this.groupFg.patchValue({
                            ...group,
                            nameAr: group.name,
                            nameEn: group.name,
                        });
                        this.currentImage.set({
                            ...group.attachment[0],
                            fullPath: this.baseUrl + group.attachment[0].fullPath,
                        });
                        this.currentPrinter.set({
                            id: group.printerId,
                            name: group.printerName,
                        });
                    },
                });
                break;
            default:
                break;
        }

        // this.setDebounceItem<{ searchValue: string; pageIndex: number }>('searchGroups', (e) =>
        //   this.searchPrinters(e.pageIndex, e.searchValue),
        // );
    }

    onSubmitForm() {
        this.groupFg.patchValue({
            nameEn: this.groupFg.value.nameAr?.trim(),
        });
        if (this.groupFg.invalid) {
            console.log('invalid');
            console.log(this.groupFg.value);
            this.groupFg.markAllAsTouched();
            return;
        }

        let formValues: { [key: string]: any } = {};

        switch (this.formMode()) {
            case FormMode.Create:
                formValues = omitKeys(this.groupFg.value, ['id', 'imagesAdd', 'listIdsOfDeleteImages']);
                break;
            case FormMode.Update:
                formValues = omitKeys(this.groupFg.value, ['images']);
                break;
        }
        const formData = new FormData();

        console.log(formValues);

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
                        this.router.navigate(['/classes/groups']);
                    },
                });
                break;
            case FormMode.Update:
                this.groupService.patch(formData).subscribe({
                    next: (res) => {
                        console.log(res);
                        this.router.navigate(['/classes/groups']);
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
    onImagesFilesSelected(event: Event) {
        const input = event.target as HTMLInputElement;

        if (input.files && input.files.length > 0) {
            if (input.files.length > 1) {
                this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يمكن اختيار اكثر من صورة' });
                return;
            }
            this.onDeleteImage();
            const file = input.files[0];

            this.currentImage.set({ file, fullPath: URL.createObjectURL(file), id: 'new-image', ix: 0 });
        }

        if (this.formMode() === FormMode.Update) {
            this.groupFg.patchValue({ imagesAdd: [input.files![0]] });
        } else {
            this.groupFg.patchValue({ images: [input.files![0]] });
        }

        input.value = '';
    }
    onDeleteImage() {
        if (!this.currentImage()?.file) {
            console.log(this.currentImage()?.id);
            this.groupFg.patchValue({ listIdsOfDeleteImages: [this.currentImage()?.id] });
        }
        this.currentImage.set(null);
    }

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
        pageIndex: 0,
        totalPagesCount: 0,
        totalRowsCount: 0,
    };
    previousSearchValue = '';
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

    debouncedPrinterSearch(event: any) {
        console.log(event);
        const searchValue = event?.term ?? '';
        if (this.previousSearchValue === searchValue) {
            this.searchPrinters(this.printersPaginationInfo.pageIndex + 1, searchValue);
        } else {
            this.searchPrinters(1, searchValue);
        }
    }
    onResetForm() {
        if (this.formMode() === FormMode.Create) {
            this.groupFg.reset();
        } else {
            this.router.navigateByUrl('/classes/groups/add');
        }
    }
    deleteGroup(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل انت متاكد من حذف المجموعة',
            header: 'حذف المجموعة',
            icon: 'pi pi-info-circle',
            rejectLabel: 'الغاء',
            rejectButtonProps: {
                label: 'الغاء',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'حذف',
                severity: 'danger',
            },
            accept: () =>
                this.groupService.delete(id).subscribe({ next: () => this.router.navigate(['/classes/groups/add']) }),
        });
    }
}
