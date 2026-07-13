import { Injectable } from '@angular/core';
import { BasehttpService } from '../../../../../../shared/services/basehttp-service';
import { environment } from '../../../../../../../environments/environment.development';
import {
  AccountLookupItem,
  ApiResponse,
  CreatePurchasePayload,
  PaginatedRows,
  ProductUnitItem,
  PurchaseListItem,
  PurchaseResponse,
  UpdatePurchasePayload,
} from '../models/purchase-invoice';

@Injectable({
  providedIn: 'root',
})
export class Purchase extends BasehttpService {
  constructor() {
    super('', {
      create: 'api/Purchase/Create',
      update: 'api/Purchase/Update',
      getAll: 'api/Purchase/GetAll',
      getById: 'api/Purchase/GetById',
      delete: 'api/Purchase/Delete',
      search: 'api/Purchase/Search',
    });
  }

  createPurchase(payload: CreatePurchasePayload) {
    return this.http.post<ApiResponse<number>>(`${environment.baseUrl}/api/Purchase/Create`, payload);
  }

  updatePurchase(payload: UpdatePurchasePayload) {
    return this.http.put<ApiResponse<number>>(`${environment.baseUrl}/api/Purchase/Update`, payload);
  }

  getPurchaseById(id: number) {
    return this.http.get<ApiResponse<PurchaseResponse>>(`${environment.baseUrl}/api/Purchase/GetById/${id}`);
  }

  getAllPurchases(pageIndex: number, pageSize: number) {
    return this.http.get<ApiResponse<PaginatedRows<PurchaseListItem>>>(
      `${environment.baseUrl}/api/Purchase/GetAll?PageIndex=${pageIndex}&PageSize=${pageSize}`,
    );
  }

  searchPurchases(payload: object) {
    return this.http.post<ApiResponse<PaginatedRows<PurchaseListItem>>>(
      `${environment.baseUrl}/api/Purchase/Search`,
      payload,
    );
  }

  deletePurchase(id: number) {
    return this.http.delete<ApiResponse<boolean>>(`${environment.baseUrl}/api/Purchase/Delete/${id}`);
  }

  getAllAccountsCash() {
    return this.http.get<ApiResponse<AccountLookupItem[]>>(environment.baseUrl + '/api/Purchase/CashAccounts');
  }

  getAllNetAccounts() {
    return this.http.get<ApiResponse<AccountLookupItem[]>>(environment.baseUrl + '/api/Purchase/NetAccounts');
  }

  searchByProductName(pageIndex: number, pageSize: number, productName: string) {
    return this.http.get<ApiResponse<PaginatedRows<{ id: number; name: string }>>>(
      environment.baseUrl +
        `/api/Purchase/SearchProductByName?PaginationInfo.PageIndex=${pageIndex}&PaginationInfo.PageSize=${pageSize}&ProductName=${productName}`,
    );
  }

  getProductCartByProductId(id: number) {
    return this.http.get<ApiResponse<ProductUnitItem[]>>(
      environment.baseUrl + '/api/Purchase/GetProductCartByProductId/' + id,
    );
  }

  getUnitById(id: number) {
    return this.http.get(environment.baseUrl + '/api/Unit/' + id, {
      headers: {
        'skip-loading': 'true',
      },
    });
  }

  searchByCode(code: string) {
    return this.http.get<ApiResponse<PaginatedRows<ProductUnitItem> | ProductUnitItem>>(
      environment.baseUrl + '/api/Purchase/SearchProductCartByBarCode?request=' + code,
    );
  }
}
