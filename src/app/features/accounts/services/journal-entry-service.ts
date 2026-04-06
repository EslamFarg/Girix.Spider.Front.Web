import { BaseCrudService, BaseSearchAndCrudService, ISearchCriteria, SearchColumEnum } from '@/core';
import { Injectable } from '@angular/core';
import { IJournalEntryReadResponse, IJournalEntrySearchResponse  } from '../types';

//JournalEntry: Id,InvoiceNumber,ReferenceNumber                                                
export enum JournalEntrySearchEnum {
  Id = SearchColumEnum.Id,
  InvoiceNumber = SearchColumEnum.InvoiceNumber,
  ReferenceNumber = SearchColumEnum.ReferenceNumber,
}

@Injectable({
  providedIn: 'root',
})
export class JournalEntryService extends BaseSearchAndCrudService<
  any,
  JournalEntrySearchEnum,
  any,
  any,
  IJournalEntryReadResponse
> {
  //v1/JournalEntry/Create
  override apiRoute = 'JournalEntry';

  /*
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
      getById: '',
    });
  }

  override search<T = IJournalEntrySearchResponse>(criteriaDto: ISearchCriteria<JournalEntrySearchEnum>) {
    return super.search<T>(criteriaDto);
  }
}
