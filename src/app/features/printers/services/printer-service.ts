import { IElectonPrintOptions } from '@/app';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable } from '@angular/core';
import {
  IPrinterCreateRequest,
  IPrinterReadResponse,
  IPrinterSearchResponseValue,
  IPrinterSearchRow,
  IPrinterUpdateRequest,
} from './printer-types';
 
export enum PrinterSearchEnum {
  Name = SearchColumEnum.Name,
}

export interface IAppPrintOptions {
  html: string;
  css: string;
}

 

@Injectable({
  providedIn: 'root',
})
export class PrinterService extends BaseSearchAndCrudService<
  IPrinterSearchResponseValue,
  PrinterSearchEnum,
  IPrinterCreateRequest,
  IPrinterUpdateRequest,
  IPrinterReadResponse
> {
  override apiRoute = 'Printer';
  isPrinterDialogVisible = false;
  printOptions: IAppPrintOptions | null = null;

  openPrinterDialog(opts: IAppPrintOptions) {
    this.printOptions = opts;
    this.isPrinterDialogVisible = true;
  }

  closePrinterDialog() {
    this.isPrinterDialogVisible = false;
    this.printOptions = null;
  }

  printOrder(opts: IAppPrintOptions) {
    this.loadingService.addLoading();

    // const electronPrintOpts: IElectonPrintOptions = {
    //   printer: {
    //     type: appPrinterType,
    //   },
    //   html: opts.html,
    //   css: opts.css,
    // };

    // window.electronAPI
    //   .print(opts)
    //   .then((e) => {
    //     console.log(e);
    //   })
    //   .catch((e) => console.log(e))
    //   .finally(() => this.loadingService.removeLoading());
  }

  
}
