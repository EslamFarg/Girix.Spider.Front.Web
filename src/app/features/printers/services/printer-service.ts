import { IElectonPrintOptions, IElectronPrintJob, IElectronPrinter } from '@/app';
import { BaseSearchAndCrudService, SearchColumEnum } from '@/core/services/BaseSearchAndCrudService';
import { Injectable, signal } from '@angular/core';
import {
    IPrinterCreateRequest,
    IPrinterReadResponse,
    IPrinterSearchResponseValue,
    IPrinterUpdateRequest,
} from '../types/printer-api';
import { AppPrinterType, IAppPrinter } from '../types/printer-app';

export enum PrinterSearchEnum {
    Name = SearchColumEnum.Name,
}

export interface IPrintJob {
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

    // ─── Dialog state ───
    isPrinterDialogVisible = signal(false);

    // ─── Selection state ───
    selectedPrinters = signal<IAppPrinter[]>([]);

    // ─── Print queue ───
    private _printQueue: IPrintJob[] = [];

    constructor() {
        super();
        this.patchEndpoints({
            getById: '',
            put: 'update',
        });
    }

    // ─────────────────────────────────────────────
    // Queue API
    // ─────────────────────────────────────────────

    /** Add jobs to the internal queue (does NOT print yet). */
    queuePrintRequest(jobs: IPrintJob[]): void {
        this._printQueue.push(...jobs);
    }

    /** Clear the queue without printing. */
    clearQueue(): void {
        this._printQueue = [];
    }

    /** Get a copy of the current queue. */
    getQueue(): IPrintJob[] {
        return [...this._printQueue];
    }

    /** Print queued jobs immediately, optionally filtering by selected printers. */
    printQueue(): void {
        if (this._printQueue.length === 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'تنبيه',
                detail: 'لا توجد مهام في قائمة الانتظار',
            });
            return;
        }
        this._executePrint(this._printQueue);
        this._printQueue = [];
    }

    /** Skip the queue and print immediately. Clears the queue first. */
    printNow(jobs: IPrintJob[]): void {
        this._printQueue = [];
        this._executePrint(jobs);
    }

    // ─────────────────────────────────────────────
    // Dialog helpers
    // ─────────────────────────────────────────────

    openPrinterDialogWithJobs(jobs: IPrintJob[]) {
        this._printQueue = jobs;
        this.isPrinterDialogVisible.set(true);
    }

    closePrinterDialog() {
        this.isPrinterDialogVisible.set(false);
        this._printQueue = [];
    }

    // ─────────────────────────────────────────────
    // Printer selection
    // ─────────────────────────────────────────────

    onPrinterSelect(printer: IAppPrinter) {
        const exists = this.selectedPrinters().find((p) => p.appPrinterType === printer.appPrinterType);
        if (exists) {
            this.selectedPrinters.set(
                this.selectedPrinters().filter((p) => p.appPrinterType !== printer.appPrinterType)
            );
        } else {
            this.selectedPrinters.set([...this.selectedPrinters(), printer]);
        }
    }

    // ─────────────────────────────────────────────
    // Legacy compatibility: print from dialog
    // ─────────────────────────────────────────────

    /** Called by dialog when user confirms. Filters queue by selected printers. */
    confirmDialogPrint(): void {
        if (this.selectedPrinters().length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'خطأ',
                detail: 'يجب تحديد طابعة',
            });
            return;
        }

        // Filter jobs: for kitchen printers, match by specific printer id
        // for captain/cashier, match by appPrinterType
        const filtered = this._printQueue.filter((job) => {
            return this.selectedPrinters().some((selected) => {
                if (job.printer.appPrinterType === AppPrinterType.programPrinter) {
                    // Kitchen: match by specific printer id
                    return selected.id === job.printer.id && selected.appPrinterType === AppPrinterType.programPrinter;
                } else {
                    // Captain/Cashier: match by appPrinterType
                    return selected.appPrinterType === job.printer.appPrinterType;
                }
            });
        });

        if (filtered.length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'خطأ',
                detail: 'لا توجد عناصر مطابقة للطابعات المحددة',
            });
            this.closePrinterDialog();
            return;
        }

        this._executePrint(filtered);
        this.closePrinterDialog();
    }

    // ─────────────────────────────────────────────
    // Electron API helpers
    // ─────────────────────────────────────────────

    async getLocalBluetoothPrinters() {
        this.loadingService.addLoading();
        try {
            return await window.electronAPI.getBluetoothPrinters();
        } finally {
            this.loadingService.removeLoading();
        }
    }

    async testPrinterConnection(printer: IElectronPrinter) {
        this.loadingService.addLoading();
        try {
            const result = await window.electronAPI.testPrinterConnection(printer);
            const severity = result.success ? 'success' : 'error';
            this.messageService.add({
                severity,
                summary: result.success ? 'نجاح' : 'خطأ',
                detail: result.message,
            });
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

    // ─────────────────────────────────────────────
    // Private
    // ─────────────────────────────────────────────

    private _executePrint(jobs: IPrintJob[], showLoading = false) {
        if (jobs.length === 0) return;

        if (showLoading) this.loadingService.addLoading();

        const electronJobs: IElectronPrintJob[] = jobs.map((job) => ({
            printer: {
                id: job.printer.id,
                type: job.printer.type,
                ipAddressOrMacAddress: job.printer.ipAddressOrMacAddress,
                port: job.printer.port,
                name: job.printer.name,
                comPort: (job.printer as any).comPort,
            },
            html: job.html,
            css: job.css,
        }));

        const opts: IElectonPrintOptions = { jobs: electronJobs };

        window.electronAPI
            .print(opts)
            .then((results) => {
                const errors = (results ?? []).filter(Boolean);
                
                // If there were failures, collect failed jobs and open dialog for retry
                if (errors.length > 0) {
                    // Map errors back to original jobs (same index order)
                    const failedJobs: IPrintJob[] = [];
                    errors.forEach((errMsg, index) => {
                        if (index < jobs.length) {
                            failedJobs.push(jobs[index]);
                        }
                    });

                    // Show error toast for each failed print
                    errors.forEach((failMsg) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'خطأ',
                            detail: failMsg,
                        });
                    });

                    // Open dialog with failed jobs so user can retry/select different printers
                    if (failedJobs.length > 0) {
                        this.openPrinterDialogWithJobs(failedJobs);
                    }
                } else {
                    // All prints succeeded
                    this.messageService.add({
                        severity: 'success',
                        summary: 'نجاح',
                        detail: 'تم الطباعة بنجاح',
                    });
                }
            })
            .catch((e) => {
                console.error(e);
                // On complete failure, open dialog with all jobs
                this.openPrinterDialogWithJobs(jobs);
            })
            .finally(() => {
                if (showLoading) this.loadingService.removeLoading();
            });
    }
}
