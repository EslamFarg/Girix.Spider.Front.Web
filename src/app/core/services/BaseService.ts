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

// id '0' is the default value
type BaseSearchEnum<SearchEnumExtension> = SearchColumEnum.Id | SearchEnumExtension;

export default class BaseService<SearchEnum = any, SearchResultType = any> {
  static apiBaseUrl = environment.apiUrl;
  apiRoute = '';
  get apiUrl() {
    return `${BaseService.apiBaseUrl}/${this.apiRoute}`;
  }
  isMock = environment.isMock;
  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);

  searchRequestModel: {
    pageIndex: number;
    totalRowsCount: number;
    pageSize: number;
    totalPagesCount: number;
    searchValues: string[];
    orderSearchEnum: BaseSearchEnum<SearchEnum>;
  } = {
    pageIndex: 1,
    totalRowsCount: 0,
    totalPagesCount: 0,
    pageSize: 10,
    searchValues: [],
    orderSearchEnum: SearchColumEnum.Id,
  };

  resetSearchRequestModel() {
    this.searchRequestModel = {
      pageIndex: 1,
      totalRowsCount: 0,
      totalPagesCount: 0,
      pageSize: 10,
      searchValues: [],
      orderSearchEnum: SearchColumEnum.Id,
    };
  }

  /**
   * @param paginationInfo default = { pageIndex: 1, pageSize: 10 }
   * @param orderSearchEnum default = 0 AKA 'Id'
   * @param searchValues default = []
   * @description paginated search
   */
  search(
    paginationInfo: Partial<{ pageIndex: number; pageSize: number }> = {
      pageIndex: 1,
      pageSize: this.searchRequestModel.pageSize,
    },
    orderSearchEnum: BaseSearchEnum<SearchEnum> = this.searchRequestModel.orderSearchEnum,
    searchValues: string[] = this.searchRequestModel.searchValues
  ) {
    const pageIndex = paginationInfo?.pageIndex || this.searchRequestModel.pageIndex;
    const pageSize = paginationInfo?.pageSize || this.searchRequestModel.pageSize;

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

    return this.http
      .post<ISearchResponse<SearchResultType>>(`${this.apiUrl}/Search`, {
        criteriaDto: {
          paginationInfo: {
            pageIndex,
            pageSize,
          },
        },
        searchFilters: [
          {
            column: orderSearchEnum,
            values: searchValues,
          },
        ],
      })
      .pipe(
        tap({
          next: (res) => {
            Object.assign(this.searchRequestModel, {
              pageIndex,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              searchValues: searchValues,
              orderSearchEnum: orderSearchEnum,
            });
          },
        })
      );
  }

  /**
   * Save/update data to localStorage
   */
  save(key: localStorageKey, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

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
  remove(key: localStorageKey) {
    localStorage.removeItem(key);
  }
}
