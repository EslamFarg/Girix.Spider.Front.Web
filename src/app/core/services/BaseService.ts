import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';

type localStorageKey = 'userDetails' | 'token' | 'forgotPasswordEmail' | 'forgotPasswordToken';
export interface ISearchResponse<T> {
  value: {
    rows: T[];
    paginationInfo: {
      currentPageIndex: number;
      totalRowsCount: number;
      totalPagesCount: number;
    };
  };
  isSuccess: boolean;
  isFailure: boolean;
  error: {
    code: string;
    args: any[];
    errorType: number;
  };
}

export enum SearchColumEnum {
  Id = 0,
  Name = 1,
  NameAr = 2,
  NameEn = 3,
  FinNumber = 4,
  OrderNumber = 5,
  OrderType = 6,
  CustomerName = 7,
  OrderPlace = 8,
  IsAvaliable = 9,
  PhoneNumber = 10,
  CategoryName = 11,
  CategoryId = 12,
  IsCompany = 13,
}

export default class BaseService<
  SearchEnum = any,
  SearchResultType = any,
  ICreateDto = any,
  IUpdateDto = any,
  IGetByIdDto = any
> {
  static apiBaseUrl = environment.apiUrl;
  apiRoute = '';
  get apiUrl() {
    return `${BaseService.apiBaseUrl}/${this.apiRoute}`;
  }
  isMock = environment.isMock;
  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);

  /**
   * @param paginationInfo default = { pageIndex: 1, pageSize: 10 }
   * @param orderSearchEnum default = 0 AKA 'Id'
   * @param searchValues default = []
   * @param fromDate UTC date string, default = null
   * @param toDate UTC date string, default = new Date().toISOString()
   * @description paginated search
   */
  search(
    paginationInfo: Partial<{ pageIndex: number; pageSize: number }> = {
      pageIndex: 1,
      pageSize: 10,
    },
    orderSearchEnum: SearchEnum,
    searchValues: string[] = [],
    fromDate: string | null = null, //start | past
    toDate: string = new Date().toISOString() //end
  ) {
    
    if (this.isMock) {
      return new Observable<ISearchResponse<SearchResultType>>((observer) => {
        observer.next({
          value: {
            rows: [],
            paginationInfo: {
              currentPageIndex: 0,
              totalRowsCount: 0,
              totalPagesCount: 0,
            },
          },
          isSuccess: true,
          isFailure: false,
          error: {
            code: '',
            args: [],
            errorType: 0,
          },
        });
        observer.complete();
      });
    }

    return this.http.post<ISearchResponse<SearchResultType>>(`${this.apiUrl}/Search`, {
      criteriaDto: {
        paginationInfo: {
          pageIndex: paginationInfo.pageIndex,
          pageSize: paginationInfo?.pageSize ?? 10,
        },
      },
      searchFilters: [
        {
          column: orderSearchEnum,
          values: searchValues,
        },
      ],
      fromDate: fromDate,
      toDate: toDate,
    });
  }

  create(createDto: ICreateDto) {
    return this.http.post<number>(`${this.apiUrl}/Create`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      })
    );
  }

  update(createDto: IUpdateDto) {
    return this.http.put<number>(`${this.apiUrl}/Update`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      })
    );
  }

  delete(id: number) {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحذف', detail: 'لقد قمت بالحذف بنجاح' });
        },
      })
    );
  }

  getById = (id: number) => this.http.get<IGetByIdDto>(`${this.apiUrl}/${id}`);

  //
  //local storage
  //

  /**
   * Save/update data to localStorage
   */
  save = (key: localStorageKey, data: any) => localStorage.setItem(key, JSON.stringify(data));

  /**
   * Get data from localStorage
   */
  get<T>(key: localStorageKey) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  }

  /**
   * Remove data from localStorage
   */
  remove = (key: localStorageKey) => localStorage.removeItem(key);
}
