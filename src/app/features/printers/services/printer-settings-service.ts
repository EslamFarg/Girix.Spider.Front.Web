import { BaseCrudService } from '@/core';
import { Injectable } from '@angular/core';
import { IPrinterSearchRow } from '../types/printer-api';

export interface IPrinterSettingsCreateRequest {
  cashierPrinterId: number;
  captionOrderPrinterId: number;
  programPrinterId: number;
}

export interface IPrinterSettingsReadResponse {
  cashierPrinter: IPrinterSearchRow;
  captionOrderPrinter: IPrinterSearchRow;
  programPrinter: IPrinterSearchRow;
}

@Injectable({
  providedIn: 'root',
})
export class PrinterSettingsService extends BaseCrudService<
  IPrinterSettingsCreateRequest,
  any,
  IPrinterSettingsReadResponse
> {
  ///v1/PrinterSetting
  override apiRoute = 'PrinterSetting';

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      create: '',
      getById: '',
    });
  }

  getSettings() {
    return this.getById('');
  }
}
