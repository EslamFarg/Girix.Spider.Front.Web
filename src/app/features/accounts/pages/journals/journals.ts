import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { Debounce } from '@/directives/debounce';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { JournalEntrySearchEnum, JournalEntryService } from '../../services/journal-entry-service';
import { IJournalEntrySearchRow } from '../../types';
import { Listbox } from "primeng/listbox";

@Component({
  selector: 'app-journals',
  templateUrl: './journals.html',
  styleUrl: './journals.css',
  imports: [
    Paginator,
    RouterLink,
    DatePipe,
    DecimalPipe,
    Debounce,
    ReactiveFormsModule,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Menu,
    TranslatePipe,
    InputText,
    Listbox
],
})
export class Journals extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<JournalEntrySearchEnum>(JournalEntrySearchEnum.InvoiceNumber, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  journalService = inject(JournalEntryService);

  filterMenuItems = [
    {
      label: 'الرقم الدفتري',
      value:JournalEntrySearchEnum.InvoiceNumber,
    },
    {
      label: 'رقم المرجع',
      value:JournalEntrySearchEnum.ReferenceNumber,
    },
  ];

  journals = signal<IJournalEntrySearchRow[]>([]);
  journalsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  constructor() {
    super();
    this.searchJournals(1);
  }

  searchJournals(pageIndex: number) {
    this.journalService
      .search({
        paginationInfo: {
          pageIndex,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum!,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
        toDate: null,
      })
      .subscribe({
        next: (res) => {
          this.journals.set(res.rows);
          this.journalsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.fg.valid && this.searchJournals(1);

  onPageChange = (event: PaginatorState) => this.searchJournals(event.page! + 1);

  deleteJournal(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف القيد؟',
      header: 'حذف القيد',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: {
        label: 'إلغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },
      accept: () => {
        this.journalService.delete(id).subscribe({
          next: () => {
            this.searchJournals(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
      },
    });
  }
}
