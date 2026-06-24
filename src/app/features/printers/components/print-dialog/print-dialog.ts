import { BaseComponent } from '@/components';
import { Component, effect, inject } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { PrinterService, AppPrinterType, PrinterType } from '../..';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrinterSettingsService } from '../../services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { PrintOptions } from '../print-options/print-options';

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
  appPrinterType = AppPrinterType;
  closePrinterDialog = this.printerService.closePrinterDialog;
  confirmDialogPrint = this.printerService.confirmDialogPrint;

  constructor() {
    super();
    effect(() => {
      if (this.printerService.isPrinterDialogVisible() && !this.printerSettingsService.printerSettings()) {
        this.printerSettingsService.getSettings().subscribe();
      }
    });
  }
}
