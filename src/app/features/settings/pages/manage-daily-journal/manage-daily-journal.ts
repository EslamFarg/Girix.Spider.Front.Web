import { Component, inject, input, OnInit, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { Button, ButtonDirective } from 'primeng/button';
import { CarouselModule, Carousel } from 'primeng/carousel';
import { Textarea } from 'primeng/textarea';
import { DailyJournalService, IUserDailyJournalResponse } from '../../services/daily-journal-service';
import { TranslatePipe } from '@ngx-translate/core';
import { OpenDailyJournal } from '../../components/open-daily-journal/open-daily-journal';
import { IUserRowResponse, IUserSearchResponseValue, UserSearchEnum, UserService } from '@/features/users';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { MessageModule } from 'primeng/message';
enum DocFormSections {
  opening = 1,
  closing = 2,
  deficitReduction = 3,
}

@Component({
  selector: 'app-manage-daily-journal',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    InputText,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref,
    Button,
    Carousel,
    Textarea,
    RouterOutlet,
    ButtonDirective,
    TranslatePipe,
    OpenDailyJournal,
    NgSelectComponent,
    Debounce,
    MessageModule,
  ],
  templateUrl: './manage-daily-journal.html',
  styleUrl: './manage-daily-journal.css',
})
export class ManageDailyJournal extends BaseComponent implements OnInit {
  DocFormSections = DocFormSections;
  initialSearchFormValue = {
    searchTerm: this.fb.control<string>('', []),
  };
  searchFg = this.fb.group(this.initialSearchFormValue);
  dailyJournalService = inject(DailyJournalService);
  userService = inject(UserService);
  links = this.dailyJournalService.links;
  currentUser = signal<IUserDailyJournalResponse | null>(null);

  id = input.required<number>();
  /**
   *
   */
  constructor() {
    super();
  }

  ngOnInit(): void {
    this.dailyJournalService.getUserDaily(this.id()).subscribe({
      next: (res) => {
        this.dailyJournalService.currentUserDaily.set(res);
      },
    });
  }

  displayedUsers = signal<IUserRowResponse[]>([]);
  previousAccountsSearchTerm = '';
  usersPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 1,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };

  searchUsers(pageIndex: number, searchTerm: string) {
    this.previousAccountsSearchTerm = searchTerm;
    this.userService
      .search<IUserSearchResponseValue>({
        paginationInfo: {
          pageIndex: 1,
          pageSize: 10,
        },
        searchFilters: [
          {
            column: UserSearchEnum.Name,
            values: [searchTerm],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res?.rows?.length > 0) {
            if (pageIndex === 1) {
              this.displayedUsers.set(res.rows);
            } else {
              this.displayedUsers.update((prev) => prev.concat(res.rows));
            }
            this.usersPaginationInfo = {
              pageIndex,
              totalPagesCount: res.paginationInfo.totalPagesCount,
              totalRowsCount: res.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  debouncedUsersSearch(event: IDebounceEvent<{ term: string }>) {
    const searchValue = event?.value.term ?? '';
    console.log(searchValue);
    if (this.previousAccountsSearchTerm === searchValue) {
      this.searchUsers(this.usersPaginationInfo.pageIndex + 1, searchValue);
    } else {
      this.searchUsers(1, searchValue);
    }
  }

  onUserSelected(event: IUserRowResponse) {
    this.dailyJournalService.getUserDaily(event.userId).subscribe({
      next: (res) => {
        this.currentUser.set(res);
        this.dailyJournalService.currentUserId = event.userId;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: err?.error?.message ?? 'غير موجود' });
      },
    });
  }
}
