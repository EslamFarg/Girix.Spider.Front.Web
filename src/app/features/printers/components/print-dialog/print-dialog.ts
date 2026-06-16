import { BaseComponent } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { IPrinterSearchRow, PrinterType, PrinterSearchEnum, PrinterService, AppPrinterType } from '../..';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { PrintOptions } from "../print-options/print-options";

export interface IAppPrinter extends IPrinterSearchRow {
  appPrinterType: AppPrinterType;
}

@Component({
  selector: 'app-print-dialog',
  imports: [Dialog, ButtonDirective, TranslatePipe, FormsModule, ReactiveFormsModule, LoadingDisabledDirective, PrintOptions],
  templateUrl: './print-dialog.html',
  styleUrl: './print-dialog.css',
})
export class PrintDialog extends BaseComponent {
  PrinterType = PrinterType;
  printerService = inject(PrinterService);
  printerSettingsService = inject(PrinterSettingsService);
  printerSettings = signal<IPrinterSettingsReadResponse | null>(null);
  appPrinterType = AppPrinterType;
  closePrinterDialog = this.printerService.closePrinterDialog;

 



  print = this.printerService.print;
}
