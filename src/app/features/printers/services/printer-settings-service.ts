import { BaseCrudService } from '@/core';
import { Injectable, signal } from '@angular/core';
import { IPrinterSearchRow } from '../types/printer-api';
import { tap } from 'rxjs';

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
    printerSettings = signal<IPrinterSettingsReadResponse | null>(null);

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
        return this.getById('').pipe(
            tap({
                next: (res) => {
                    this.printerSettings.set(res);
                },
            }),
        );
    }
}
