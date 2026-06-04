import BaseService from '@/core/services/BaseService';
import { AuthService } from '@/features/auth/services/auth-service';
import { inject, Injectable, signal } from '@angular/core';
import { tap } from 'rxjs';

export interface IOpenDailyJournalSessionRequest {
  custodyBalance: number;
  openingNotes: string;
  dateTime: string;
}

export interface ICloseDailyJournalSessionRequest {
  cashClosingAmount: number;
  networkClosingAmount: number;
  closingNotes: string;
  closingDate: string;
}

export interface IUserDailyJournalResponse {
  isSuccess: boolean;
  isFailure: boolean;
  error: {
    code: string;
    args: string[];
    errorType: number;
  };
  value: {
    userId: number;
    name: string;
    phoneNumber: string;
    email: string;
    groupId: string;
    groupName: string;
    description: string;
    isActive: boolean;
    totalShortage: number;
    cashierCollectionAccountId: number;
    cashierCollectionAccountName: string;
    custodyAccountId: number;
    custodyAccountName: string;
    cashPaymentAccountId: number;
    cashPaymentAccountName: string;
    bankPaymentAccountId: number;
    bankPaymentAccountName: string;
    shortage: {
      id: number;
      shortage: number;
      openStartDate: string;
      endEndDate: string;
    }[];
    dailyJournalPeriods: {
      isOpening: boolean;
      openingBalance: number;
      custodyBalance: number;
      openingNotes: string;
      openStartDate: string;
      openingClosingBalance: number;
      custodyClosingBalance: number;
      cashClosingAmount: number;
      networkClosingAmount: number;
      closingNotes: string;
      openingBalanceAccountName: string;
      custodyAccountName: string;
      cashAccountName: string;
      networkAccountName: string;
    };
  };
}
export interface ICurrentUserDailyJournalResponse {
  openingBalance: number;
  custodyBalance: number;
  cashBalance: number;
  networkBalance: number;
  isOpening: boolean;
  openStartDate: string;
  closingDate: string;
  totalShortage: number;
  totalSalesAmount: number;
  openingBalanceAccountName: string;
  custodyAccountName: string;
  cashAccountName: string;
  networkAccountName: string;
}

@Injectable({
  providedIn: 'root',
})
export class DailyJournalService extends BaseService {
  override apiRoute = 'DailyJournalPeriod';
  authService = inject(AuthService);
  get loggedInUserId() {
    return +(this.authService.userDetails()?.userId ?? 0);
  }
  currentUserId: any = null;
  //
  //
  //
  //
  //
  //

  links = signal<{ routerLink: string; labelKey: string }[]>([]);
  openStateLinks = [
    {
      routerLink: 'close-daily-journal',
      labelKey: 'DAILY_JOURNAL.CLOSING',
    },
    {
      routerLink: 'reset-shortage',
      labelKey: 'DAILY_JOURNAL.RESET_SHORTAGE',
    },
  ];
  closedStateLinks = [
    {
      routerLink: 'open-daily-journal',
      labelKey: 'settings.daily-journal.opening',
    },
  ];

  handleClosedDailyJournalState = () => {
    this.links.set(this.closedStateLinks);
    //check if current link is open-daily-journal
  };

  handleOpenedDailyJournalState = () => {
    this.links.set(this.openStateLinks);
    //check if current link is open-daily-journal
  };

  //
  //
  //
  //
  //
  //

  openDailySession = (dto: IOpenDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/OpenDailySession`, dto);

  openUserDailySession = (dto: IOpenDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/OpenDailySession/ByUser/${this.currentUserId}`, dto);

  closeDailySession = (dto: ICloseDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/CloseDailySession`, dto);

  closeUserDailySession = (dto: ICloseDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/CloseDailySession/ByUser/${this.currentUserId}`, dto);

  ///v1/DailyJournalPeriod/OpenDailySession
  currentUserDaily = signal<null | IUserDailyJournalResponse>(null);
  getCurrentUserDaily = () => {
    return this.http
      .get<ICurrentUserDailyJournalResponse>(`${this.apiUrl}/OpenDailySession`);
  };

  getUserDaily = (userId: number = this.currentUserId) =>
    this.http
      .get<IUserDailyJournalResponse>(`${this.apiUrl}/UserDaily/ByUser/${userId}`);


      // /v1/DailyJournalPeriod/ResetTotalShortage/ByUser/{userId}
  resetShortage = (userId: number = this.currentUserId) =>
    this.http
      .put<any>(`${this.apiUrl}/ResetTotalShortage/ByUser/${userId}`, null);
}
