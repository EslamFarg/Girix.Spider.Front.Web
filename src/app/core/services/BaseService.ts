import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';

type localStorageKey = 'userDetails' | 'token' | 'forgotPasswordEmail' | 'forgotPasswordToken';
export interface IBaseSearchResponse<T> {
  value: T;
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
  OrderIsCollectes = 14,
  IsAddition = 15,
  ReservedTo = 16,
}

export interface IEndpoints {
  create: string;
  update: string;
  getById: string;
  delete: string;
  put: string;
  search: string;
}

export default abstract class BaseService<
  SearchEnum = any,
  ICreateDto = any,
  IUpdateDto = any,
  IGetByIdDto = any,
  ISearchResponseValue = any,
> {
  static apiBaseUrl = environment.apiUrl;
  private endpoints: IEndpoints = {
    create: 'Create',
    update: '',
    put: '',
    getById: '/',
    delete: '',
    search: 'Search',
  };

  protected patchEndpoints(endpoints: Partial<IEndpoints>) {
    console.log(endpoints);
    this.endpoints = { ...this.endpoints, ...endpoints };
  }

  apiRoute = '';
  get apiUrl() {
    return `${BaseService.apiBaseUrl}/${this.apiRoute}`;
  }
  isMock = environment.isMock;

  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);

  //
  //
  //
  //
  //
  //
  //
  //
  //
  /**
   * @param paginationInfo default = { pageIndex: 1, pageSize: 10 }
   * @param orderSearchEnum default = 0 AKA 'Id'
   * @param searchValues default = []
   * @param fromDate UTC date string, default = null
   * @param toDate UTC date string, default = new Date().toISOString()
   * @description paginated search
   */
  search(criteriaDto: {
    paginationInfo: Partial<{ pageIndex: number; pageSize: number }>;
    searchFilters: { column: SearchEnum; values: string[] }[];
    fromDate: string | null; //start | past
    toDate?: string; //end;
    removeDateFilter?: boolean;
  }) {
    if (this.isMock) {
      return new Observable<IBaseSearchResponse<ISearchResponseValue>>((observer) => {
        observer.next({
          value: {} as ISearchResponseValue,
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

    let body: any = {
      criteriaDto: {
        paginationInfo: {
          pageIndex: criteriaDto?.paginationInfo.pageIndex ?? 1,
          pageSize: criteriaDto?.paginationInfo?.pageSize ?? 10,
        },
      },
      searchFilters: criteriaDto.searchFilters.map((x) => ({
        column: x.column,
        values: x.values.map((y) => y.trim()),
      })),
      fromDate: criteriaDto?.fromDate ?? null,
      toDate: criteriaDto?.toDate ?? new Date().toISOString(),
    };

    // if (criteriaDto.removeDateFilter) {
    //    body = {
    //     criteriaDto: {
    //       paginationInfo: {
    //         pageIndex: criteriaDto?.paginationInfo.pageIndex ?? 1,
    //         pageSize: criteriaDto?.paginationInfo?.pageSize ?? 10,
    //       },
    //     },
    //     searchFilters: criteriaDto.searchFilters,
    //   };
    // }

    return this.http.post<IBaseSearchResponse<ISearchResponseValue>>(`${this.apiUrl}/${this.endpoints.search}`, body);
  }

  create<IDefaultCreateDto=ICreateDto>(createDto: IDefaultCreateDto | FormData) {
    return this.http.post<number>(`${this.apiUrl}/${this.endpoints.create}`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  put<IDefaultUpdateDto=IUpdateDto>(createDto: IDefaultUpdateDto | FormData) {
    return this.http.put<number>(`${this.apiUrl}/${this.endpoints.update}`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  patch<IDefaultUpdateDto=IUpdateDto>(createDto: IDefaultUpdateDto | FormData) {
    return this.http.patch<number>(`${this.apiUrl}/Update`, createDto).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحفظ', detail: 'لقد قمت بالحفظ بنجاح' });
        },
      }),
    );
  }

  delete(id: number) {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`).pipe(
      tap({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'تم الحذف', detail: 'لقد قمت بالحذف بنجاح' });
        },
      }),
    );
  }

  getById = (id: number) => this.http.get<IGetByIdDto>(`${this.apiUrl}/${this.endpoints.getById}${id}`);

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
