import BaseService from '@/core/services/BaseService';
import { AuthService } from '@/features/auth/services/auth-service';
import { inject, Injectable } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class DailyJournalService extends BaseService {
  override apiRoute = 'DailyJournalPeriod';
  authService = inject(AuthService);
  get userId() {
    return this.authService.userDetails()?.userId;
  }

  openDailySession = (dto: IOpenDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/OpenDailySession`, dto);

  closeDailySession = (dto: ICloseDailyJournalSessionRequest) =>
    this.http.post<any>(`${this.apiUrl}/CloseDailySession`, dto);

  currentUserDaily = () =>
    this.http.get<IUserDailyJournalResponse>(`${this.apiUrl}/UserDaily/ByUser/${this.userId}`);
}
