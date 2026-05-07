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
} from '../types/printer-api';
import { AppPrinterType, IAppPrinter } from '../types/printer-app';

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

  /**
   *
   */
  constructor() {
    super();
    this.patchEndpoints({
      getById: '',
      put: 'update',
    });
  }

  openPrinterDialog(opts: IAppPrintOptions) {
    this.printOptions = opts;
    this.isPrinterDialogVisible = true;
  }

  closePrinterDialog() {
    this.isPrinterDialogVisible = false;
    this.printOptions = null;
  }

  printOrder(printers: IAppPrinter[]) {
    if (this.printOptions === null) return;

    this.loadingService.addLoading();
    const electronPrintOpts: IElectonPrintOptions = {
      printers: printers.map((p) => ({
        id: p.id,
        type: p.type,
        ipAddressOrMacAddress: p.ipAddressOrMacAddress,
        port: p.port,
        name: p.name,
      })),
      html: this.printOptions.html,
      css: this.printOptions.css,
    };

    window.electronAPI
      .print(electronPrintOpts)
      .then((e) => {
        console.log('------------printer finished printing-----------');
        console.log(e);

        e?.forEach((failMsg) => {
          console.log(failMsg);
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: failMsg,
          });
        });
        console.log('-----------------------');
      })
      .catch((e) => console.log(e))
      .finally(() => this.loadingService.removeLoading());
  }

  printJobs(jobs: { printer: IPrinterSearchRow; html: string; css: string }[]) {
    if (jobs.length === 0) return;

    this.loadingService.addLoading();

    const promises = jobs.map((job) => {
      const electronPrintOpts: IElectonPrintOptions = {
        printers: [
          {
            id: job.printer.id,
            type: job.printer.type,
            ipAddressOrMacAddress: job.printer.ipAddressOrMacAddress,
            port: job.printer.port,
            name: job.printer.name,
          },
        ],
        html: job.html,
        css: job.css,
      };
      return window.electronAPI.print(electronPrintOpts);
    });

    Promise.all(promises)
      .then((results) => {
        const allErrors = results.flat().filter(Boolean);
        allErrors.forEach((failMsg) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: failMsg,
          });
        });
        if (allErrors.length === 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'نجاح',
            detail: 'تم الطباعة بنجاح',
          });
        }
      })
      .catch((e) => console.log(e))
      .finally(() => this.loadingService.removeLoading());
  }

  async getLocalBluetoothPrinters() {
    this.loadingService.addLoading();
    try {
      const e = await window.electronAPI
        .getBluetoothPrinters();
      return e;
    } finally {
      this.loadingService.removeLoading();
    }
  }
}
