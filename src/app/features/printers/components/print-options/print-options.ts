import { BaseComponent } from '@/components';
import { Component, computed, inject, input, signal, TemplateRef } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { IPrinterSearchRow, PrinterType, PrinterSearchEnum, PrinterService, AppPrinterType, IAppPrinter } from '../..';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { NgTemplateOutlet } from '@angular/common';

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
    printerItems = computed<IAppPrinter[]>(() => {
        const printers = this.printerSettings();

        if (!printers) {
            return [];
        }

        return Object.entries(this.printerSettings()!).map(([key, value]) => {
            return { appPrinterType: key, ...value };
        });
    });

    printers = signal<IPrinterSearchRow[]>([]);

    onPrinterSelect = this.printerService.onPrinterSelect;
    print = this.printerService.print;
}
