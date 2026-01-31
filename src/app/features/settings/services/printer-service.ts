import BaseService, { SearchColumEnum } from '@/core/services/BaseService';
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
export class PrinterService extends BaseService<
  PrinterSearchEnum,
  IPrinterCreateRequest,
  IPrinterUpdateRequest,
  IPrinterReadResponse,
  IPrinterSearchResponseValue
> {
  override apiRoute = 'Printer';
}
