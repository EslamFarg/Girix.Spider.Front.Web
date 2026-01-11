import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { HutService, IHutDtoResponse, IHutRowResponse } from '../../services/hut-service';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';

@Component({
  selector: 'app-huts',
  imports: [
    Button,
    ReactiveFormsModule,
    InputGroupAddon,
    InputErrorMessageHandler,
    Select,
    InputTextModule,
    SectionWrapper,
    Paginator,
    AllowNumbers,
    ButtonDirective,
  ],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent<IHutRowResponse> {
  currentItem: IHutDtoResponse | null = null;

  initialFormValue = {
    id: this.fb.control<number>(0, []),
    name: this.fb.control<string>('', [
      noSymbolsAllowed,
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    pricePerHour: this.fb.control<number>(0, [Validators.required, Validators.min(1), Validators.max(100_000)]),
  };

  fg = this.fb.group(this.initialFormValue);

  hutService = inject(HutService);

  constructor() {
    super();

    this.resetState();
  }

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  resetState = () => {
    this.resetForm();
    this.hutService.resetSearchRequestModel();
    //get page 1 of 10 orders
    this.hutService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
        this.first = 0;
      },
    });
  };

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    if ((this.fg.value?.id ?? 0) > 0) {
      // update
      this.hutService.update(this.fg.getRawValue()).subscribe({
        next: this.resetState,
      });
    } else {
      // create
      this.hutService.create(omitKeys(this.fg.getRawValue(), ['id'])).subscribe({
        next: this.resetState,
      });
    }
  }

  resetForm = () => {
    this.fg = this.fb.group(this.initialFormValue);
    this.currentItem = null;
  };

  first = 0;
  rows = 10;

  onPageChange(event: PaginatorState) {
    this.hutService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  fetchAndBindTableData(tableId: number) {
    return this.hutService.getById(tableId).subscribe({
      next: (res) => {
        this.fg.patchValue(res);
        this.currentItem = res;
      },
    });
  }

  deleteHut(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الكوخ؟',
      header: 'حذف الكوخ',
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

      accept: () => {
        this.hutService.delete(id).subscribe({
          next: () => {
            this.resetState();
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
