import { Component, computed, effect, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent } from '@/components/base-component/base-component';
import { DailyJournalService } from '../../services/daily-journal-service';
import { IUserRowResponse, IUserSearchResponseValue, UserSearchEnum, UserService } from '@/features/users';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Debounce, IDebounceEvent } from '@/directives/debounce';
import { MessageModule } from 'primeng/message';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { ManageOpenDailyJournal } from '../../components/manage-open-daily-journal/manage-open-daily-journal';
import { ManageCloseDailyJournal } from '../../components/manage-close-daily-journal/manage-close-daily-journal';
import { ResetShortage } from '../../components/reset-shortage/reset-shortage';

enum ManageDailyJournalSections {
  closing = 'closing',
  deficitReduction = 'deficitReduction',
}

@Component({
  selector: 'app-manage-daily-journal',
  imports: [
    SectionWrapper,
    NgSelectComponent,
    Debounce,
    MessageModule,
    ButtonDirective,
    TranslatePipe,
    ManageOpenDailyJournal,
    ManageCloseDailyJournal,
    ResetShortage,
  ],
  templateUrl: './manage-daily-journal.html',
  styleUrl: './manage-daily-journal.css',
})
export class ManageDailyJournal extends BaseComponent {
  ManageDailyJournalSections = ManageDailyJournalSections;

  dailyJournalService = inject(DailyJournalService);
  userService = inject(UserService);

  currentUserDaily = this.dailyJournalService.currentUserDaily;
  currentUser = computed(() => this.currentUserDaily()?.value ?? null);
  isOpening = computed(() => Boolean(this.currentUser()?.dailyJournalPeriods?.isOpening));
  activeSection = signal<ManageDailyJournalSections>(ManageDailyJournalSections.closing);
  visibleSections = computed(() =>
    this.isOpening()
      ? [
          {
            key: ManageDailyJournalSections.closing,
            labelKey: 'DAILY_JOURNAL.CLOSING',
          },
          {
            key: ManageDailyJournalSections.deficitReduction,
            labelKey: 'DAILY_JOURNAL.RESET_SHORTAGE',
          },
        ]
      : [],
  );

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

  constructor() {
    super();
    this.searchUsers(1, '');

    effect(() => {
      const userDaily = this.currentUserDaily();
      if (!userDaily) return;

      this.activeSection.set(ManageDailyJournalSections.closing);
    });
  }

  searchUsers(pageIndex: number, searchTerm: string) {
    this.previousAccountsSearchTerm = searchTerm;
    this.userService
      .search<IUserSearchResponseValue>({
        paginationInfo: {
          pageIndex,
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
          if (pageIndex === 1) {
            this.displayedUsers.set(res?.rows ?? []);
          } else if (res?.rows?.length) {
            this.displayedUsers.update((prev) => prev.concat(res.rows));
          }

          this.usersPaginationInfo = {
            pageIndex,
            totalPagesCount: res.paginationInfo.totalPagesCount,
            totalRowsCount: res.paginationInfo.totalRowsCount,
          };
        },
      });
  }

  debouncedUsersSearch(event: IDebounceEvent<{ term: string }>, searchTerm: string) {
    const searchValue = searchTerm ?? '';
    const isScrollEvent = event.type === 'scrollToEnd';
    const canLoadMore = this.usersPaginationInfo.pageIndex < this.usersPaginationInfo.totalPagesCount;

    if (isScrollEvent && this.previousAccountsSearchTerm === searchValue && canLoadMore) {
      this.searchUsers(this.usersPaginationInfo.pageIndex + 1, searchValue);
      return;
    }

    if (!isScrollEvent) {
      this.searchUsers(1, searchValue);
    }
  }

  onUserSelected(event: IUserRowResponse) {
    this.dailyJournalService.currentUserId = event.userId;
    this.dailyJournalService.getUserDaily(event.userId).subscribe({
      next: (res) => {
        this.dailyJournalService.currentUserDaily.set(res);
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err?.error?.message ?? 'Not found' });
      },
    });
  }

  setActiveSection(section: ManageDailyJournalSections) {
    this.activeSection.set(section);
  }
}
