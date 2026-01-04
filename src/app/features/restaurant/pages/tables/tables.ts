import { Component, inject } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { ITableRowResponse, TableService } from '../../services/table-service';

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
  ],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent<ITableRowResponse> {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  tableService = inject(TableService);

  constructor() {
    super();

    this.tableService.resetSearchRequestModel();

    //get page 1 of 10 orders
    this.tableService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: PaginatorState) {
    console.log(event);
    this.tableService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }
}
