import { BaseComponent } from '@/components';
import { Component, computed, inject, input } from '@angular/core';
import { IPrintJob, PrinterService, AppPrinterType, IAppPrinter, PrinterType } from '../..';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';
import { NgTemplateOutlet } from '@angular/common';

export interface IPrintOptionItem {
    id: number;
    name: string;
    type: PrinterType;
    ipAddressOrMacAddress: string;
    port: number;
    appPrinterType: AppPrinterType;
    comPort?: string | number | null;
    isKitchenGroup?: boolean; // true if this is a specific kitchen printer group
}

@Component({
    selector: 'app-print-options',
    imports: [NgTemplateOutlet],
    templateUrl: './print-options.html',
    styleUrl: './print-options.css',
})
export class PrintOptions extends BaseComponent {
    PrinterType = PrinterType;
    printerService = inject(PrinterService);
    printerSettingsService = inject(PrinterSettingsService);
    appPrinterType = AppPrinterType;
    closePrinterDialog = this.printerService.closePrinterDialog;
    styleClass = input<string>('app-print-options');
    printerSettings = this.printerSettingsService.printerSettings;
    selectedPrinters = this.printerService.selectedPrinters;

    // When true, shows all configured printer roles from settings (for cashier final submission dialog)
    // When false, shows only printers that have jobs in the queue (for retry dialog)
    showAllRoles = input<boolean>(true);

    // Dynamic printer items based on current print queue or all configured roles.
    // IMPORTANT: reads printQueue$ signal so this computed re-runs whenever the queue changes.
    printerItems = computed<IPrintOptionItem[]>(() => {
        const settings = this.printerSettings();
        const queue = this.printerService.printQueue$(); // ← reactive signal read

        // When queue has jobs: build list from queue data (no settings required).
        // This covers the Collections / invoice reprint path.
        if (queue.length > 0) {
            return this._buildFromQueue(queue);
        }

        // Queue empty + showAllRoles: show all printers from settings (Cashier payment dialog).
        if (this.showAllRoles() && settings) {
            return this._buildFromSettings(settings);
        }

        return [];
    });

    private _buildFromSettings(settings: IPrinterSettingsReadResponse): IPrintOptionItem[] {
        const items: IPrintOptionItem[] = [];

        if (settings.programPrinter) {
            items.push({
                id: settings.programPrinter.id,
                name: settings.programPrinter.name,
                type: settings.programPrinter.type,
                ipAddressOrMacAddress: settings.programPrinter.ipAddressOrMacAddress,
                port: settings.programPrinter.port,
                appPrinterType: AppPrinterType.programPrinter,
                comPort: settings.programPrinter.comPort,
            });
        }

        if (settings.captionOrderPrinter) {
            items.push({
                id: settings.captionOrderPrinter.id,
                name: settings.captionOrderPrinter.name,
                type: settings.captionOrderPrinter.type,
                ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                port: settings.captionOrderPrinter.port,
                appPrinterType: AppPrinterType.captionOrderPrinter,
                comPort: settings.captionOrderPrinter.comPort,
            });
        }

        if (settings.cashierPrinter) {
            items.push({
                id: settings.cashierPrinter.id,
                name: settings.cashierPrinter.name,
                type: settings.cashierPrinter.type,
                ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                port: settings.cashierPrinter.port,
                appPrinterType: AppPrinterType.cashierPrinter,
                comPort: settings.cashierPrinter.comPort,
            });
        }

        return items;
    }

    /**
     * Build printer option items directly from the jobs in the queue.
     * Does NOT require printer settings — all data comes from the job's printer property.
     * This is the reliable path for Collections / invoice reprint dialogs.
     */
    private _buildFromQueue(queue: IPrintJob[]): IPrintOptionItem[] {
        const seen = new Map<string, IPrintOptionItem>();

        for (const job of queue) {
            const key = `${job.printer.appPrinterType}-${job.printer.id}`;
            if (seen.has(key)) continue;

            seen.set(key, {
                id: job.printer.id,
                name: job.printer.name,
                type: job.printer.type,
                ipAddressOrMacAddress: job.printer.ipAddressOrMacAddress,
                port: job.printer.port,
                appPrinterType: job.printer.appPrinterType,
                comPort: (job.printer as any).comPort ?? null,
                isKitchenGroup: job.printer.appPrinterType === AppPrinterType.programPrinter,
            });
        }

        return [...seen.values()];
    }

    onPrinterSelect(item: IPrintOptionItem) {
        const exists = this.selectedPrinters().find((p) => 
            p.id === item.id && p.appPrinterType === item.appPrinterType
        );
        if (exists) {
            this.selectedPrinters.set(
                this.selectedPrinters().filter((p) => 
                    !(p.id === item.id && p.appPrinterType === item.appPrinterType)
                )
            );
        } else {
            this.selectedPrinters.set([...this.selectedPrinters(), item as IAppPrinter]);
        }
    }

    isPrinterSelected(item: IPrintOptionItem) {
        return this.selectedPrinters().some(
            (p) => p.id === item.id && p.appPrinterType === item.appPrinterType,
        );
    }

    isPosCompact() {
        return this.styleClass().includes('payment-print-pos');
    }

    getPrinterRoleLabel(item: IPrintOptionItem): string {
        switch (item.appPrinterType) {
            case AppPrinterType.cashierPrinter:
                return 'طابعة كاشير';
            case AppPrinterType.captionOrderPrinter:
                return 'طابعة كابتن أوردر';
            case AppPrinterType.programPrinter:
                return 'طابعة المطبخ';
            default:
                return item.name;
        }
    }

    print = this.printerService.confirmDialogPrint;
}
