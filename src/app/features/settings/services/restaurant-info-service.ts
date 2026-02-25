import { BaseCrudService } from '@/core';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';

export interface IRestaurantInfoReadResponse {
  nameAr: string;
  nameEn: string;
  phoneNumber: string;
  postalCode: string;
  vatNumber: string;
  commercialRegNo: string;
  city: string;
  district: string;
  buildingNumber: string;
  logoUrl: string;
}

export interface IRestaurantInfoUpdateRequest extends Omit<IRestaurantInfoReadResponse, 'logoUrl'> {
  logoUrl: File;
}

@Injectable({
  providedIn: 'root',
})
export class RestaurantInfoService extends BaseCrudService<any, IRestaurantInfoUpdateRequest, any> {
  override apiRoute = 'Setting';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({ create: '' });
  }

  getSettings() {
    return this.http.get<IRestaurantInfoReadResponse>(this.apiUrl);
  }
}
