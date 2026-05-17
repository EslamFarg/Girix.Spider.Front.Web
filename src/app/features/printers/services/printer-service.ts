import { IElectonPrintOptions, IElectronPrintJob, IElectronPrinter } from '@/app';
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

/** Combined print option where each entry has its own printer + html + css */
export interface IPrintOrderOption {
  printer: IAppPrinter;
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
  /** When set, contains pre-grouped print jobs (one per printer) */
  printJobsQueue: IPrintOrderOption[] | null = null;

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
    this.printJobsQueue = null;
    this.isPrinterDialogVisible = true;
  }

  openPrinterDialogWithJobs(jobs: IPrintOrderOption[]) {
    this.printOptions = null;
    this.printJobsQueue = jobs;
    this.isPrinterDialogVisible = true;
  }

  closePrinterDialog() {
    this.isPrinterDialogVisible = false;
    this.printOptions = null;
    this.printJobsQueue = null;
  }

  printOrder(options: IPrintOrderOption[]) {
    if (options.length === 0) return;

    console.log('--- PrinterService.printOrder ---');
    console.log(`Sending ${options.length} print jobs:`);
    options.forEach((o, i) => console.log(`  Job ${i}: type=${o.printer.appPrinterType}, printer=${o.printer.name} (id=${o.printer.id}), html length=${o.html.length}`));

    this.loadingService.addLoading();

    const jobs: IElectronPrintJob[] = options.map((opt) => ({
      printer: {
        id: opt.printer.id,
        type: opt.printer.type,
        ipAddressOrMacAddress: opt.printer.ipAddressOrMacAddress,
        port: opt.printer.port,
        name: opt.printer.name,
      },
      html: opt.html,
      css: opt.css,
    }));

    const electronPrintOpts: IElectonPrintOptions = { jobs };

    window.electronAPI
      .print(electronPrintOpts)
      .then((results) => {
        const errors = (results ?? []).filter(Boolean);
        errors.forEach((failMsg) => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: failMsg,
          });
        });
        if (errors.length === 0) {
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

  async testPrinterConnection(printer: IElectronPrinter) {
    this.loadingService.addLoading();
    try {
      const result = await window.electronAPI.testPrinterConnection(printer);
      if (result.success) {
        this.messageService.add({
          severity: 'success',
          summary: 'نجاح',
          detail: result.message,
        });
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: result.message,
        });
      }
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      this.messageService.add({
        severity: 'error',
        summary: 'خطأ',
        detail: msg,
      });
      return { success: false, message: msg };
    } finally {
      this.loadingService.removeLoading();
    }
  }
}
