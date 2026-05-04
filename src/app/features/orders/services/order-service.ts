import { BaseSearchAndCrudService } from '@/core/services/BaseSearchAndCrudService';
import { Injectable } from '@angular/core';
import { IOrderBillReadResponse, IOrderReadResponse, IOrderSearchResponseValue } from '../types/api/read';
import { ILocalPlaceChangeRequest, IOrderAddItemsRequest, IOrderChangeTypeRequest, IOrderCreateRequest } from '../types/api/write';
import { OrderSearchEnum } from '../types/api/enums';
import { Subject, tap } from 'rxjs';

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
  localPlaceChange = new Subject();

  changeLocalPlace(dto: ILocalPlaceChangeRequest) {
    return this.http.put<any>(`${this.apiUrl}/change-place`, dto).pipe(
      tap({
        next: () => this.localPlaceChange.next(undefined),
      }),
    );
  }

  ///v1/Order/add-items
  addItems(dto: IOrderAddItemsRequest) {
    return this.http.post<any>(`${this.apiUrl}/add-items`, dto);
  }

  getBill(id: number) {
    return this.http.get<IOrderBillReadResponse>(`${this.apiUrl}/${id}/bill`);
  }

  //v1/Order/change-type
  changeType(dto: IOrderChangeTypeRequest) {
    return this.http.put<{invoice:IOrderBillReadResponse}>(`${this.apiUrl}/change-type`, dto);
  }
}
