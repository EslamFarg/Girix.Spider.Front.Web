import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { GroupsNav } from '../../components/groups-nav/groups-nav';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Debounce } from '@/directives/debounce';
import { IGroupRowResponse, GroupSearchEnum, GroupService } from '../../services/group-service';
import { MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';

@Component({
  selector: 'app-groups',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    GroupsNav,
    SectionWrapper,
    Debounce,
    Menu,
  ],
  templateUrl: './groups.html',
  styleUrl: './groups.css',
})
export class Groups extends BaseComponent  {
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
    { label: 'اخر يوم', value: this.getPreviousUTCDate(1) },
    { label: 'اخر اسبوع', value: this.getPreviousUTCDate(7) },
    { label: 'اخر شهر', value: this.getPreviousUTCDate(30) },
    { label: 'اخر سنة', value: this.getPreviousUTCDate(365) },
  ];
groups = signal<IGroupRowResponse[]>([]);
groupsPaginationInfo:IPaginationInfo={
  pageIndex:1,
  totalPagesCount:0,
  totalRowsCount:0
}
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
      message: 'هل انت متاكد من حذف الوجبة؟',
      header: 'حذف الوجبة؟',
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
