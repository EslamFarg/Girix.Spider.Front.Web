import { BaseComponent } from '@/components';
import { Component, computed, inject, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { IPrinterSearchRow, PrinterType, PrinterSearchEnum, PrinterService, AppPrinterType } from '../..';
import { ButtonDirective } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IPrinterSettingsReadResponse, PrinterSettingsService } from '../../services/printer-settings-service';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';

export interface IAppPrinter extends IPrinterSearchRow {
  appPrinterType: AppPrinterType;
}

@Component({
  selector: 'app-print-dialog',
  imports: [Dialog, ButtonDirective, TranslatePipe, FormsModule, ReactiveFormsModule, LoadingDisabledDirective],
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

  printerItems = computed<IAppPrinter[]>(() => {
    const printers = this.printerSettings();

    if (!printers) {
      return [];
    }

    return Object.entries(this.printerSettings()!).map(([key, value]) => {
      return { appPrinterType: key, ...value };
    });
  });

  /**
   *
   */
  constructor() {
    super();
    this.printerSettingsService.getSettings().subscribe({
      next: (res) => this.printerSettings.set(res),
    });
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
    const queuedJobs = this.printerService.printJobsQueue;
    if (queuedJobs && queuedJobs.length > 0) {
      console.log(`Queued jobs: ${queuedJobs.length}`);
      queuedJobs.forEach((j, i) =>
        console.log(`  Queued ${i}: type=${j.printer.appPrinterType}, printer=${j.printer.name} (id=${j.printer.id})`),
      );

      const selectedTypes = new Set(this.selectedPrinters().map((p) => p.appPrinterType));
      console.log('Selected types:', [...selectedTypes]);

      const filteredOptions = queuedJobs.filter((job) => selectedTypes.has(job.printer.appPrinterType));
      console.log(`Filtered options: ${filteredOptions.length}`);
      filteredOptions.forEach((j, i) => console.log(`  Filtered ${i}: type=${j.printer.appPrinterType}`));

      if (filteredOptions.length > 0) {
        this.printerService.printOrder(filteredOptions);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'لا توجد عناصر مطابقة للطابعات المحددة',
        });
      }
      this.printerService.closePrinterDialog();
      return;
    }

    // Fallback: legacy single-HTML print to all selected printers
    const opts = this.printerService.printOptions;
    if (opts) {
      const printOptions = this.selectedPrinters().map((p) => ({
        printer: p,
        html: opts.html,
        css: opts.css,
      }));
      this.printerService.printOrder(printOptions);
    }
  }


  visibleChange(isVisible:boolean) {
    console.log('print visibleChange', isVisible);
    this.printerSettingsService.getSettings().subscribe({next: (res) => this.printerSettings.set(res)});
  }
}
