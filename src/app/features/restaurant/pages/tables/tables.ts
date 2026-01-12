import { Component, inject } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ITableDtoResponse, ITableRowResponse, TableSearchEnum, TableService } from '../../services/table-service';
import { noSymbolsAllowed } from '@/lib/text-validators';
import { omitKeys } from '@/lib/helpers';

@Component({
  selector: 'app-tables',
  imports: [
    Button,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    ReactiveFormsModule,
    InputTextModule,
    SectionWrapper,
    Paginator,
    ButtonDirective,
  ],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent<ITableRowResponse> {
  currentItem: ITableDtoResponse | null = null;
  initialFormValue = {
    id: this.fb.control<number>(0, []),
    searchEnum: this.fb.control<TableSearchEnum>(TableSearchEnum.Name, []),
    name: this.fb.control<string>('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(100),
      noSymbolsAllowed,
    ]),
  };
  fg = this.fb.group(this.initialFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  tableService = inject(TableService);

  constructor() {
    super();

    this.resetState();
  }

  resetState = () => {
    this.resetForm();

    //get page 1 of 10 orders
    this.tableService.search({ pageIndex: 1 }, this.fg.getRawValue().searchEnum).subscribe({
      next: (res) => {
        this.first = 0;
        this.items.set(res.value.rows);
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
      this.tableService.update(this.fg.getRawValue()).subscribe({
        next: this.resetState,
      });
    } else {
      this.tableService.create(omitKeys(this.fg.getRawValue(), ['id'])).subscribe({
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
    console.log(event);
    this.tableService.search({ pageIndex: event.page! + 1 }, this.fg.getRawValue().searchEnum).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  fetchAndBindTableData(tableId: number) {
    return this.tableService.getById(tableId).subscribe({
      next: (res) => {
        this.fg.patchValue(res);
        this.currentItem = res;
      },
    });
  }

  deleteTable(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الطاولة؟',
      header: 'حذف الطاولة',
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
        this.tableService.delete(id).subscribe({
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
