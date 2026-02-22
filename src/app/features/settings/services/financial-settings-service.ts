import { AmountType } from '@/core';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IFinancialSettingsResponse {
  serviceFeeType: AmountType;
  serviceFee: number;
  deliveryFeeType: AmountType;
  deliveryFee: number;
  discountType: AmountType;
  discount: number;
  vat: number;
  minimumSelectiveTax: number;
}

export interface IFinancialSettingsRequest {
  serviceFeeType: AmountType;
  serviceFee: number;
  deliveryFeeType: AmountType;
  deliveryFee: number;
  discountType: AmountType;
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

  updateSettings(data: IFinancialSettingsRequest) {
    return this.http.post<IFinancialSettingsResponse>(this.apiUrl, data);
  }
}
