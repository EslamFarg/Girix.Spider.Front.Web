import { BaseComponent } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { PrinterSearchEnum, PrinterService } from '../../services/printer-service';
import { IPrinterSearchRow, PrinterType } from '../../services/printer-types';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';

enum appPrinterType {
  cashierPrinter = 'cashierPrinter',
  captionOrderPrinter = 'captionOrderPrinter',
  programPrinter = 'programPrinter',
}

export interface IAppPrinter extends IPrinterSearchRow {
  appPrinterType: appPrinterType;
}

@Component({
  selector: 'app-print-dialog',
  imports: [Dialog, ButtonDirective, TranslatePipe, FormsModule, ReactiveFormsModule],
  templateUrl: './print-dialog.html',
  styleUrl: './print-dialog.css',
})
export class PrintDialog extends BaseComponent {
  PrinterType = PrinterType;
  printerService = inject(PrinterService);
  printerSettingsService = inject(PrinterSettingsService);
  printerSettings = signal<IPrinterSettingsReadResponse | null>(null);
  appPrinterType = appPrinterType;
  closePrinterDialog = this.printerService.closePrinterDialog;

  printerItems = computed<IAppPrinter[]>(() => {
    if (!this.printerSettings()) return [];

    return Object.entries(this.printerSettings()!).map(([key, value]) => {
      console.log(key);
      return { appPrinterType: key, ...value };
    });
  });

  /**
   *
   */
  constructor() {
    super();
    this.printerSettingsService.getSettings().subscribe((res) => this.printerSettings.set(res));
  }

  printers = signal<IPrinterSearchRow[]>([]);
  selectedPrinters = signal<IAppPrinter[]>([]);

  onPrinterSelect(printer: IAppPrinter) {
    const existingPrinter = this.selectedPrinters().find((p) => p.appPrinterType === printer.appPrinterType);
    if (existingPrinter) {
      const filteredPrinters = this.selectedPrinters().filter((p) => p.appPrinterType !== printer.appPrinterType);
      this.selectedPrinters.set(filteredPrinters);
    } else {
      this.selectedPrinters.set([...this.selectedPrinters(), printer]);
    }
  }

  print() {
    console.log(this.selectedPrinters());
    if (this.selectedPrinters().length === 0) {
      this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'يجب تحديد طابعة' });
      return;
    }
    // if (printer.isAvailable) {
    //   this.orderFg.patchValue({ placeRefId: printer.id, placeType: OrderLocalType.Printer });
    //   this.printerDialogVisible = false;
    //   this.messageService.add({ severity: 'success', summary: 'نجاح', detail: 'تم اختيار الموقع' });
    // } else {
    //   this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'الموقع مشغول' });
    // }
  }
}
