import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Debounce } from '@/directives/debounce';
import { IGroupSearchRow, GroupSearchEnum, GroupService } from '../../services/group-service';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-groups',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
    Debounce,
    Menu,
    TranslatePipe,
    RouterLink,
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<GroupSearchEnum>(GroupSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  groupService = inject(GroupService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.fg.patchValue({ searchEnum: GroupSearchEnum.Name }),
    },
  ]);

  constructor() {
    super();

    this.searchGroups(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];
  groups = signal<IGroupSearchRow[]>([]);
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
            column: this.fg.getRawValue().searchEnum,
            values: [this.fg.getRawValue().searchTerm],
          },
        ],
        fromDate: this.fg.getRawValue().fromDate,
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

  onSubmit = () => this.fg.valid && this.searchGroups(1);

  onPageChange = (event: PaginatorState) => this.searchGroups(event.page! + 1);

  deleteGroup(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف الطابعة',
      header: 'حذف الطابعة',
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

      accept: () => this.groupService.delete(id).subscribe({ next: () => this.searchGroups(1) }),
      reject: () => this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' }),
    });
  }
}
