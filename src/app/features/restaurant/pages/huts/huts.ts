import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { API_GRID_PAGE_SIZE } from '@/core/constants/pagination.constants';
import { HutSearchEnum, HutService, IHutReadResponse, IHutSearchRow } from '../../services/hut-service';
import {
  clearMasterDataEditMode,
  isMasterDataRowSelected,
  logRowSelectClick,
  RowSelectSource,
  selectMasterDataRow,
} from '../../utils/master-data-row-edit';
import { AllowNumbers } from '@/directives/allow-numbers';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { omitKeys } from '@/yn-ng/utils/helpers';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { TooltipModule } from 'primeng/tooltip';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-huts',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputTextModule,
    SectionWrapper,
    AllowNumbers,
    ButtonDirective,
    Debounce,
    LoadingDisabledDirective,
    TooltipModule,
    TranslatePipe,
  ],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent {
  currentItem: IHutReadResponse | null = null;

  initialHutFormValue = {
    id: this.fb.control<number>(0, []),
    name: this.fb.control<string>('', [
      noSymbolsAllowed,
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    pricePerHour: this.fb.control<number>(0, [Validators.required, Validators.min(1), Validators.max(1_000_000)]),
  };
  hutFg = this.fb.group(this.initialHutFormValue);

  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<HutSearchEnum>(HutSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };

  searchFg = this.fb.group(this.initialSearchFormValue);

  hutService = inject(HutService);

  get isEditMode() {
    return !!this.currentItem;
  }

  isRowSelected = (rowId: number) => isMasterDataRowSelected(rowId, this.currentItem);

  resetHutForm = () => clearMasterDataEditMode(this.hutFg, (item) => (this.currentItem = item));

  onRowSelect(item: IHutSearchRow, source: RowSelectSource = 'row') {
    logRowSelectClick(item, source, 'huts');
    selectMasterDataRow(
      item.id,
      (id) => this.hutService.getById(id),
      this.hutFg,
      (res) => (this.currentItem = res),
      { pricePerHour: item.pricePerHour },
      { screen: 'huts', source },
    );
  }

  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: () => this.searchFg.patchValue({ searchEnum: HutSearchEnum.Name }),
    },
    {
      label: 'متاح',
      command: () => this.searchFg.patchValue({ searchEnum: HutSearchEnum.IsAvaliable }),
    },
  ]);

  constructor() {
    super();

    this.searchHuts();
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  huts = signal<IHutSearchRow[]>([]);

  searchHuts() {
    this.hutService
      .search({
        paginationInfo: {
          pageIndex: 1,
          pageSize: API_GRID_PAGE_SIZE,
        },
        searchFilters: [
          {
            column: this.searchFg.getRawValue().searchEnum,
            values: [this.searchFg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.searchFg.getRawValue().fromDate,
      })
      .subscribe({
        next: (res) => {
          this.huts.set(res.value.rows);
        },
      });
  }

  onSearchSubmit = () => this.searchFg.valid && this.searchHuts();

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

      accept: () =>
        this.hutService.delete(id).subscribe({
          next: () => {
            if (this.currentItem?.id === id) this.resetHutForm();
            this.searchHuts();
          },
        }),
    });
  }

  onHutFormSubmit() {
    if (this.hutFg.invalid) {
      this.hutFg.markAllAsTouched();
      return;
    }

    if (this.currentItem) {
      this.hutService.put(this.hutFg.getRawValue()).subscribe({
        next: () => {
          this.searchHuts();
          this.resetHutForm();
        },
      });
    } else {
      this.hutService.create(omitKeys(this.hutFg.getRawValue(), ['id'])).subscribe({
        next: () => {
          this.searchHuts();
          this.resetHutForm();
        },
      });
    }
  }
}
