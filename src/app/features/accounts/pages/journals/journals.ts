import { BaseComponent, IPaginationInfo, SectionWrapper } from '@/components';
import { Debounce } from '@/directives/debounce';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { Menu } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SortDirection } from '@/core';
import { JournalEntrySearchEnum, JournalEntryService } from '../../services/journal-entry-service';
import { IJournalEntrySearchRow } from '../../types';
import { Listbox } from 'primeng/listbox';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-journals',
  templateUrl: './journals.html',
  styleUrl: './journals.css',
  imports: [
    Paginator,
    RouterLink,
    DatePipe,
    Debounce,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    Menu,
    InputText,
    Listbox,
    TooltipModule,
  ],
})
export class Journals extends BaseComponent {
  protected readonly JournalEntrySearchEnum = JournalEntrySearchEnum;

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<JournalEntrySearchEnum>(JournalEntrySearchEnum.Id, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  journalService = inject(JournalEntryService);

  filterMenuItems = [
    { label: 'رقم القيد',     value: JournalEntrySearchEnum.Id },
    { label: 'الرقم الدفتري', value: JournalEntrySearchEnum.InvoiceNumber },
    { label: 'المرجع',        value: JournalEntrySearchEnum.ReferenceNumber },
  ];

  private _filterValue = toSignal(this.fg.controls.searchEnum.valueChanges, {
    initialValue: this.fg.controls.searchEnum.value!,
  });

  /** Dynamic placeholder that matches the active filter */
  searchPlaceholder = computed(() => {
    switch (this._filterValue()) {
      case JournalEntrySearchEnum.Id:              return 'ابحث برقم القيد';
      case JournalEntrySearchEnum.InvoiceNumber:   return 'ابحث بالرقم الدفتري';
      case JournalEntrySearchEnum.ReferenceNumber: return 'ابحث بالمرجع';
      default: return 'ابحث...';
    }
  });

  /** Label shown as a visual badge inside the search box */
  activeFilterLabel = computed(() =>
    this.filterMenuItems.find((f) => f.value === this._filterValue())?.label ?? ''
  );

  journals = signal<IJournalEntrySearchRow[]>([]);
  journalsPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  constructor() {
    super();
    this.searchJournals(1);

    // Clear search term whenever the filter type changes
    this.fg.controls.searchEnum.valueChanges.subscribe(() => {
      this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    });
  }

  searchJournals(pageIndex: number) {
    this.journalService
      .search({
        paginationInfo: { pageIndex, pageSize: 10 },
        searchFilters: [
          {
            column: this.fg.getRawValue().searchEnum!,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
        toDate: null,
        // Instruct the backend to return newest journals first (ORDER BY Id DESC).
        // Client-side sort below is a fallback for backends that ignore these fields.
        sortBy: 'Id',
        sortDirection: SortDirection.Desc,
      })
      .subscribe({
        next: (res) => {
          // Client-side fallback sort — guarantees newest-first even if the backend
          // does not yet respect sortBy/sortDirection.
          this.journals.set([...res.rows].sort((a, b) => b.id - a.id));
          this.journalsPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  /**
   * Called by p-listbox (onChange) — immediately closes the filter dropdown
   * and fires a fresh search with the newly selected filter type.
   */
  onFilterSelect(filterMenu: Menu) {
    filterMenu.hide();
    this.fg.controls.searchTerm.setValue('', { emitEvent: false });
    this.searchJournals(1);
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
    });
  }
}
