import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputText } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { BaseComponent } from '@/components/base-component/base-component';
import { Validators } from '@angular/forms';
import { IPrinterSearchRow, PrinterService, PrinterType } from '@/features/printers';

@Component({
  selector: 'app-add-printer',
  imports: [SectionWrapper, InputText, InputErrorMessageHandler, InputGroupAddon, Button, Paginator],
  templateUrl: './add-printer.html',
  styleUrl: './add-printer.css',
})
export class AddPrinter extends BaseComponent {
  PrinterType = PrinterType;
  printerFg = {
    name: this.fb.control<string | null>(null, [Validators.required]),
    ipAddressOrMacAddress: this.fb.control<string | null>(null, [Validators.required]),
    port: this.fb.control<number | null>(null, [Validators.required]),
    type: this.fb.control<PrinterType>(PrinterType.Bluetooth, [Validators.required]),
  };
  printers = signal<IPrinterSearchRow[]>([]);
  /**
   *
   */
  constructor() {
    super();
    this.getPrinters().subscribe((e) => this.printers.set(e.value.rows));
  }

  fg = this.fb.group(this.printerFg);
  printerService = inject(PrinterService);

  onSubmit() {}

  getPrinters() {
    return this.printerService.search({
      paginationInfo: {
        pageIndex: 0,
        pageSize: 0,
      },
      searchFilters: [],
      fromDate: null,
    });
  }

  ping(msg: string) {
    window.electronAPI
      .ping(msg)
      .then((e) => {
        console.log(e);
      })
      .catch((e) => console.log(e));
  }

  printScreen() {
    window.print();
  }
}
