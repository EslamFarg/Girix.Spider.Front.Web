import { Observable } from 'rxjs';
import { IBaseSearchResponse } from './BaseCrudService';
import BaseService from './BaseService';

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

type Ctor<T = {}> = new (...args: any[]) => T;

export function SearchableMixin<TBase extends Ctor<BaseService>>(Base: TBase) {
  return function <ISearchResponseValue, SearchEnum>() {
    return class extends Base {
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

        return this.http.post<IBaseSearchResponse<ISearchResponseValue>>(
          `${this.apiUrl}/${this.endpoints.search}`,
          body,
        );
      }
    };
  };
}

// export function SearchableMixin<ISearchResponseValue, SearchEnum, TBase extends Ctor<BaseService> = Ctor<BaseService>>(
//   Base: TBase,
// ) {
//   return class extends Base {

//   };
// }
