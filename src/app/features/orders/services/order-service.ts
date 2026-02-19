import { BaseSearchAndCrudService } from '@/core/services/BaseSearchAndCrudService';
import { Injectable } from '@angular/core';
import { IOrderBillReadResponse, IOrderReadResponse, IOrderSearchResponseValue } from './order-types/read';
import { ILocalPlaceChangeRequest, IOrderAddItemsRequest, IOrderCreateRequest } from './order-types/write';
import { OrderSearchEnum } from './order-types/enums';

@Injectable({
  providedIn: 'root',
})
export class OrderService extends BaseSearchAndCrudService<
  IOrderSearchResponseValue,
  OrderSearchEnum,
  IOrderCreateRequest,
  any,
  IOrderReadResponse
> {
  override apiRoute = 'Order';

  changeLocalPlace(dto: ILocalPlaceChangeRequest) {
    return this.http.put<any>(`${this.apiUrl}/change-place`, dto);
  }

  ///v1/Order/add-items
  addItems(dto: IOrderAddItemsRequest) {
    return this.http.post<any>(`${this.apiUrl}/add-items`, dto);
  }

  getBill(id: number) {
    return this.http.get<IOrderBillReadResponse>(`${this.apiUrl}/${id}/bill`);
  }
}
