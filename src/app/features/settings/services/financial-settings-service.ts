import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IFinancialSettingsResponse {
  serviceFeeType: number;
  serviceFee: number;
  deliveryFeeType: number;
  deliveryFee: number;
  discountType: number;
  discount: number;
  vat: number;
  minimumSelectiveTax: number;
}

@Injectable({
  providedIn: 'root',
})
export class FinancialSettingsService extends BaseService {
  override apiRoute = 'FinancialSetting';

  getSettings() {
    return this.http.get<IFinancialSettingsResponse>(this.apiUrl);
  }
}
