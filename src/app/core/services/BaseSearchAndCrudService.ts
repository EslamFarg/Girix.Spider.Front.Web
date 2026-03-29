import { Observable } from 'rxjs';
import { BaseCrudService } from './BaseCrudService';
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

export interface ISearchCriteria<SearchEnum> {
  paginationInfo: Partial<{ pageIndex: number; pageSize: number }>;
  searchFilters: { column: SearchEnum; values: string[] }[];
  fromDate: string | null; //start | past
  toDate?: string; //end;
  removeDateFilter?: boolean;
  searchEndpoint?: string;
}

export class BaseSearchAndCrudService<
  ISearchResponseValue,
  SearchEnum,
  ICreateDto = any,
  IUpdateDto = any,
  IGetByIdDto = any,
> extends BaseCrudService<ICreateDto, IUpdateDto, IGetByIdDto> {
  search<T = IBaseSearchResponse<ISearchResponseValue>>(criteriaDto: ISearchCriteria<SearchEnum>) {
    const searchEndpoint = criteriaDto.searchEndpoint ?? this.endpoints.search;
    // if (this.isMock) {
    //   return new Observable<T>((observer) => {
    //     observer.next({
    //       value: {} as ISearchResponseValue,
    //       isSuccess: true,
    //       isFailure: false,
    //       error: {
    //         code: '',
    //         args: [],
    //         errorType: 0,
    //       },
    //     });
    //     observer.complete();
    //   });
    // }

    let body: any = {
      criteriaDto: {
        paginationInfo: {
          pageIndex: criteriaDto?.paginationInfo.pageIndex ?? 1,
          pageSize: criteriaDto?.paginationInfo?.pageSize ?? 10,
        },
      },
      searchFilters: criteriaDto.searchFilters.map((x) => ({
        column: x.column,
        values: x.values.map((y) => y?.trim()??''),
      })),
      fromDate: criteriaDto?.fromDate ?? null,
      toDate: criteriaDto?.toDate ?? this.localDateIso,
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

    return this.http.post<T>(`${this.apiUrl}/${searchEndpoint}`, body);
  }
}
