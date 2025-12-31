import { IPaginatedResponse } from '@/core/interfaces/responses';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
export interface ICategory {
  id: number;
  name: string;
  printerName: string;
  isOnCasher: boolean;
  attachment: ICategoryAttachment[];
}

export interface ICategoryAttachment {
  id: number;
  fullPath: string;
}
@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends BaseService {
  getList(
    IsOnCasher: boolean = false,
    paginationInfo: { pageIndex: number; pageSize: number } = { pageIndex: 0, pageSize: 0 }
  ) {
    return this.http.post<IPaginatedResponse<ICategory>>(
      `${this.apiUrl}/Category/ListCategoriesOnCasher?IsOnCasher=${IsOnCasher}`,
      {
        paginationInfo,
      }
    );
  }
}
