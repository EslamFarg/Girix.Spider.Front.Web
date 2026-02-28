import { BaseComponent, IPaginationInfo } from '@/components/base-component/base-component';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator, PaginatorState } from 'primeng/paginator';
import { UsersNav } from '../../components/users-nav/users-nav';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { UserSearchEnum, UserService } from '../../services/user-service';
import { MenuItem } from 'primeng/api';
import { Debounce } from '@/directives/debounce';
import { Menu } from 'primeng/menu';
import { RouterLink } from '@angular/router';
import { IUserRowResponse } from '../../types/users/api';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-users',
  imports: [
    Paginator,
    UsersNav,
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    ReactiveFormsModule,
    InputText,
    Debounce,
    Menu,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users extends BaseComponent {
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', [Validators.maxLength(100)]),
    searchEnum: this.fb.control<UserSearchEnum>(UserSearchEnum.Name, [Validators.required]),
    fromDate: this.fb.control<string | null>(null, []),
    toDate: this.fb.control<string>(new Date().toISOString(), [Validators.required]),
  };
  searchFg = this.fb.group(this.initialSearchFormValue);

  userService = inject(UserService);
  filterMenuItems = signal<MenuItem[]>([
    {
      label: 'الاسم',
      command: (event) => this.searchFg.patchValue({ searchEnum: UserSearchEnum.Name }),
    },
    {
      label: 'رقم الهاتف',
      command: (event) => this.searchFg.patchValue({ searchEnum: UserSearchEnum.PhoneNumber }),
    },
  ]);

  constructor() {
    super();

    this.searchUsers(1);
  }

  periodOptions = [
    { label: 'الكل', value: null },
    { label: 'اخر يوم', value: this.getPreviousLocalDateIso(1) },
    { label: 'اخر اسبوع', value: this.getPreviousLocalDateIso(7) },
    { label: 'اخر شهر', value: this.getPreviousLocalDateIso(30) },
    { label: 'اخر سنة', value: this.getPreviousLocalDateIso(365) },
  ];

  users = signal<IUserRowResponse[]>([]);

  usersPaginationInfo: IPaginationInfo = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
  };

  searchUsers(pageIndex: number) {
    this.userService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 10,
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
          //@ts-ignore
          this.users.set(res.rows);
          this.usersPaginationInfo = {
            pageIndex,
            //@ts-ignore
            totalPagesCount: res.paginationInfo.totalPagesCount,
            //@ts-ignore
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  onSubmit = () => this.searchFg.valid && this.searchUsers(1);

  onPageChange = (event: PaginatorState) => this.searchUsers(event.page! + 1);

  deleteUser(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل انت متاكد من حذف المنتج',
      header: 'حذف المنتج',
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
        this.userService.delete(id).subscribe({
          next: () => {
            this.searchUsers(1);
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'الغاء', detail: 'لقد قمت بالغاء الحذف' });
      },
    });
  }
}
