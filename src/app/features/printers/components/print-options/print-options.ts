import { BaseComponent } from '@/components';
import { Component, computed, inject, input, signal, TemplateRef } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { IPrintJob, PrinterService, AppPrinterType, IAppPrinter, PrinterType, PrinterSearchEnum, IPrinterSearchRow } from '../..';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { NgTemplateOutlet } from '@angular/common';

export interface IPrintOptionItem {
    id: number;
    name: string;
    type: PrinterType;
    ipAddressOrMacAddress: string;
    port: number;
    appPrinterType: AppPrinterType;
    comPort?: number;
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

    // Dynamic printer items based on current print queue or all configured roles
    printerItems = computed<IPrintOptionItem[]>(() => {
        const settings = this.printerSettings();
        const queue = this.printerService.getQueue();

        if (!settings) {
            return [];
        }

        // If queue is empty and showAllRoles is true, show all configured printer roles
        // This is used in the cashier final submission dialog
        if (queue.length === 0 && this.showAllRoles()) {
            return this._buildFromSettings(settings);
        }

        // Otherwise, show only printers that have jobs in the queue
        // This is used when the dialog is opened with specific jobs (retry dialog)
        return this._buildFromQueue(settings, queue);
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
                comPort: settings.programPrinter.comPort ?? 0,
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
                comPort: settings.captionOrderPrinter.comPort ?? 0,
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
                comPort: settings.cashierPrinter.comPort ?? 0,
            });
        }

        return items;
    }

    private _buildFromQueue(settings: IPrinterSettingsReadResponse, queue: IPrintJob[]): IPrintOptionItem[] {
        const items: IPrintOptionItem[] = [];

        // Group queue jobs by appPrinterType to detect multiple kitchen printers
        const kitchenJobs = queue.filter(j => j.printer.appPrinterType === AppPrinterType.programPrinter);
        const captainJobs = queue.filter(j => j.printer.appPrinterType === AppPrinterType.captionOrderPrinter);
        const cashierJobs = queue.filter(j => j.printer.appPrinterType === AppPrinterType.cashierPrinter);

        // Kitchen: if multiple different printers, show each one
        if (kitchenJobs.length > 0) {
            const uniqueKitchenPrinters = new Map<number, IPrintJob>();
            for (const job of kitchenJobs) {
                if (!uniqueKitchenPrinters.has(job.printer.id)) {
                    uniqueKitchenPrinters.set(job.printer.id, job);
                }
            }

            if (uniqueKitchenPrinters.size > 1) {
                // Multiple kitchen printers - show each one
                for (const [, job] of uniqueKitchenPrinters) {
                    items.push({
                        id: job.printer.id,
                        name: job.printer.name,
                        type: job.printer.type,
                        ipAddressOrMacAddress: job.printer.ipAddressOrMacAddress,
                        port: job.printer.port,
                        appPrinterType: AppPrinterType.programPrinter,
                        comPort: (job.printer as any).comPort ?? 0,
                        isKitchenGroup: true,
                    });
                }
            } else {
                // Single kitchen printer - show as "Kitchen Printer"
                items.push({
                    id: settings.programPrinter?.id ?? kitchenJobs[0]!.printer.id,
                    name: settings.programPrinter?.name ?? kitchenJobs[0]!.printer.name,
                    type: settings.programPrinter?.type ?? kitchenJobs[0]!.printer.type,
                    ipAddressOrMacAddress: settings.programPrinter?.ipAddressOrMacAddress ?? kitchenJobs[0]!.printer.ipAddressOrMacAddress,
                    port: settings.programPrinter?.port ?? kitchenJobs[0]!.printer.port,
                    appPrinterType: AppPrinterType.programPrinter,
                    comPort: settings.programPrinter?.comPort ?? 0,
                });
            }
        }

        // Captain: always show as single option
        if (settings.captionOrderPrinter) {
            const hasCaptainJobs = captainJobs.length > 0;
            if (hasCaptainJobs) {
                items.push({
                    id: settings.captionOrderPrinter.id,
                    name: settings.captionOrderPrinter.name,
                    type: settings.captionOrderPrinter.type,
                    ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
                    port: settings.captionOrderPrinter.port,
                    appPrinterType: AppPrinterType.captionOrderPrinter,
                    comPort: settings.captionOrderPrinter.comPort ?? 0,
                });
            }
        }

        // Cashier: always show as single option
        if (settings.cashierPrinter) {
            const hasCashierJobs = cashierJobs.length > 0;
            if (hasCashierJobs) {
                items.push({
                    id: settings.cashierPrinter.id,
                    name: settings.cashierPrinter.name,
                    type: settings.cashierPrinter.type,
                    ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
                    port: settings.cashierPrinter.port,
                    appPrinterType: AppPrinterType.cashierPrinter,
                    comPort: settings.cashierPrinter.comPort ?? 0,
                });
            }
        }

        return items;
    }

    printers = signal<IPrinterSearchRow[]>([]);

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

    print = this.printerService.confirmDialogPrint;
}
