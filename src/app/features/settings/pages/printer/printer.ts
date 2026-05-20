import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button, ButtonDirective } from 'primeng/button';
import { BaseComponent } from '@/components';
import { IPrinterSearchRow, PrinterType, PrinterSearchEnum, PrinterService } from '@/features/printers';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-printer',
  imports: [SectionWrapper, InputErrorMessageHandler, Select, Button, ReactiveFormsModule, ButtonDirective, LoadingDisabledDirective],
  templateUrl: './printer.html',
  styleUrl: './printer.css',
})
export class Printer extends BaseComponent {
  fg = this.fb.group({
    cashierPrinterId: this.fb.control<number | null>(null, [Validators.required]),
    captionOrderPrinterId: this.fb.control<number | null>(null, [Validators.required]),
    programPrinterId: this.fb.control<number | null>(null, [Validators.required]),
  });

  constructor() {
    super();

    this.searchPrinters(0);

    this.printerSettingsService.getSettings().subscribe((res) => {
      this.fg.patchValue({
        cashierPrinterId: res.cashierPrinter.id,
        captionOrderPrinterId: res.captionOrderPrinter.id,
        programPrinterId: res.programPrinter.id,
      });
    });
  }

  PrinterType = PrinterType;
  printerService = inject(PrinterService);
  printerSettingsService = inject(PrinterSettingsService);
  printers = signal<IPrinterSearchRow[]>([]);
  printerPaginationInfo: {
    pageIndex: number;
    totalPagesCount: number;
    totalRowsCount: number;
  } = {
    pageIndex: 0,
    totalPagesCount: 0,
    totalRowsCount: 0,
  };
  searchPrinters(pageIndex: number) {
    this.printerService
      .search({
        paginationInfo: {
          pageIndex: pageIndex,
          pageSize: 0,
        },
        searchFilters: [
          {
            column: PrinterSearchEnum.Name,
            values: [''],
          },
        ],
        fromDate: null,
      })
      .subscribe({
        next: (res) => {
          if (res.value.rows.length > 0) {
            this.printers.set(res.value.rows);
            this.printerPaginationInfo = {
              pageIndex,
              totalPagesCount: res.value.paginationInfo.totalPagesCount,
              totalRowsCount: res.value.paginationInfo.totalRowsCount,
            };
          }
        },
      });
  }

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }
    this.printerSettingsService.create(this.fg.value).subscribe();
  }

  async testPrinterConnection(printer: IPrinterSearchRow) {
    await this.printerService.testPrinterConnection({
      id: printer.id,
      name: printer.name,
      ipAddressOrMacAddress: printer.ipAddressOrMacAddress,
      port: printer.port,
      type: printer.type,
    });
  }
}
