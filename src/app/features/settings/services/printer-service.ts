import { BaseCrudService } from '@/core/services/BaseCrudService';
import BaseService from '@/core/services/BaseService';
import { SearchableMixin, SearchColumEnum } from '@/core/services/interfaces';
import { Injectable } from '@angular/core';

export enum PrinterSearchEnum {
  Name = SearchColumEnum.Name,
}

export interface IPrinterCreateRequest {
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  type: number;
}

export interface IPrinterUpdateRequest {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  type: number;
}

export interface IPrinterReadResponse {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  type: number;
}

export interface IPrinterSearchRow {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  type: number;
}

export interface IPrinterSearchResponseValue {
  rows: IPrinterSearchRow[];
  paginationInfo: {
    totalRowsCount: number;
    totalPagesCount: number;
    currentPageIndex: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class PrinterService extends SearchableMixin(
  BaseCrudService<IPrinterCreateRequest, IPrinterUpdateRequest, IPrinterReadResponse>,
)<IPrinterSearchResponseValue, PrinterSearchEnum>() {
  override apiRoute = 'Printer';
}
