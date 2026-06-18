import { BaseSearchAndCrudService } from '@/core/services/BaseSearchAndCrudService';
import { Injectable, signal } from '@angular/core';
import { IOrderBillReadResponse, IOrderReadResponse, IOrderSearchResponseValue } from '../types/api/read';
import {
    ILocalPlaceChangeRequest,
    IOrderAddItemsRequest,
    IOrderChangeTypeRequest,
    IOrderCreateRequest,
} from '../types/api/write';
import { OrderSearchEnum } from '../types/api/enums';
import { Subject, tap } from 'rxjs';
import { ChosenLocalPlace } from '@/components/local-place-select/local-place-select';

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
    reset=new Subject();
    localPlaceChange = new Subject();
    chosenLocalPlace = signal<ChosenLocalPlace | null>(null);

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
        return this.http.put<{ invoice: IOrderBillReadResponse }>(`${this.apiUrl}/change-type`, dto);
    }

    ///v1/Order/change-OrderDelivery
    assignOrdersToDelivery(dto: { deliveryId: number; orderIds: number[] }) {
        return this.http.put<any>(`${this.apiUrl}/change-OrderDelivery`, dto);
    }

    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
    //
}
