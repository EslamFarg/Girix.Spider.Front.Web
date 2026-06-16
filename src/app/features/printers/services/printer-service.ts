import { IElectonPrintOptions, IElectronPrintJob, IElectronPrinter } from '@/app';
import { BaseCrudService } from '@/core/services/BaseCrudService';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import BaseService from '@/core/services/BaseService';
import { Injectable, signal } from '@angular/core';
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
    isPrinterDialogVisible = signal(false);
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
        this.isPrinterDialogVisible.set(true);
    }

    openPrinterDialogWithJobs(jobs: IPrintOrderOption[]) {
        this.printOptions = null;
        this.printJobsQueue = jobs;
        this.isPrinterDialogVisible.set(true);
    }

    closePrinterDialog() {
        this.isPrinterDialogVisible.set(false);
        this.printOptions = null;
        this.printJobsQueue = null;
    }

    printOrder(options: IPrintOrderOption[]) {
        if (options.length === 0) return;

 

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
            const e = await window.electronAPI.getBluetoothPrinters();
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



    selectedPrinters = signal<IAppPrinter[]>([]);

    onPrinterSelect(printer: IAppPrinter) {
        const existingPrinter = this.selectedPrinters().find((p) => p.id === printer.id);
        if (existingPrinter) {
            const filteredPrinters = this.selectedPrinters().filter((p) => p.appPrinterType !== printer.appPrinterType);
            this.selectedPrinters.set(filteredPrinters);
        } else {
            this.selectedPrinters.set([...this.selectedPrinters(), printer]);
        }
    }

    print() {
        if (this.selectedPrinters().length === 0) {
            this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب تحديد طابعة' });
            return;
        }

        console.log('--- PrintDialog.print ---');
        console.log(
            'Selected printers:',
            this.selectedPrinters().map((p) => ({ type: p.appPrinterType, name: p.name, id: p.id })),
        );

        // If pre-grouped print jobs are queued, filter by selected printer types
        const queuedJobs = this.printJobsQueue;
        if (queuedJobs && queuedJobs.length > 0) {
            console.log(`Queued jobs: ${queuedJobs.length}`);
            queuedJobs.forEach((j, i) =>
                console.log(
                    `  Queued ${i}: type=${j.printer.appPrinterType}, printer=${j.printer.name} (id=${j.printer.id})`,
                ),
            );

            const selectedTypes = new Set(this.selectedPrinters().map((p) => p.appPrinterType));
            console.log('Selected types:', [...selectedTypes]);

            const filteredOptions = queuedJobs.filter((job) => selectedTypes.has(job.printer.appPrinterType));
            console.log(`Filtered options: ${filteredOptions.length}`);
            filteredOptions.forEach((j, i) => console.log(`  Filtered ${i}: type=${j.printer.appPrinterType}`));

            if (filteredOptions.length > 0) {
                this.printOrder(filteredOptions);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'خطأ',
                    detail: 'لا توجد عناصر مطابقة للطابعات المحددة',
                });
            }
            this.closePrinterDialog();
            return;
        }

        // Fallback: legacy single-HTML print to all selected printers
        const opts = this.printOptions;
        if (opts) {
            const printOptions = this.selectedPrinters().map((p) => ({
                printer: p,
                html: opts.html,
                css: opts.css,
            }));
            this.printOrder(printOptions);
        }
    }
}
