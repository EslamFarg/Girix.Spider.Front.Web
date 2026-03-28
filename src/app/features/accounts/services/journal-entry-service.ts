import { BaseCrudService } from '@/core';
import { Injectable } from '@angular/core';

export interface IJournalEntryReadResponse {
  id: number
  voucherNo: string
  refNumber: any
  voucherDate: string
  paymentMethod: string
  notes: string
  isHasTax: boolean
  totalAmount: number
  totalDebit: number
  totalCredit: number
  debitLines: IDebitLine[]
  creditLines: ICreditLine[]
}

export interface IDebitLine {
  finincalAccountId: number
  finincalAccountName: string
  isHasTax: boolean
  totalAmount: number
  notes: string
}

export interface ICreditLine {
  finincalAccountId: number
  finincalAccountName: string
  isHasTax: boolean
  totalAmount: number
  notes: string
}


@Injectable({
  providedIn: 'root',
})
export class JournalEntryService extends BaseCrudService<any, any, IJournalEntryReadResponse> {
  ///v1/JournalEntry/Create
  override apiRoute = 'JournalEntry';

  /*
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: 'create',
      put: 'update',
      getById:""
    })
  }
 
}
