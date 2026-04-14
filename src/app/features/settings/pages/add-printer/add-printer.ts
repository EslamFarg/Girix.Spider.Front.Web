import { Component, inject, signal } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputText } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Button, ButtonDirective } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { IPrinterSearchRow, PrinterService, PrinterType } from '@/features/printers';
import { Dialog } from 'primeng/dialog';
import { IBluetoothPrinter } from '@/app';

@Component({
  selector: 'app-add-printer',
  imports: [
    SectionWrapper,
    InputText,
    InputErrorMessageHandler,
    InputGroupAddon,
    Button,
    Paginator,
    ReactiveFormsModule,
    Dialog,
    ButtonDirective
],
  templateUrl: './add-printer.html',
  styleUrl: './add-printer.css',
})
export class AddPrinter extends BaseComponent {
  PrinterType = PrinterType;
  printerFg = {
    name: this.fb.control<string | null>(null, [Validators.required]),
    ipAddressOrMacAddress: this.fb.control<string | null>(null, [Validators.required]),
    port: this.fb.control<any>(null, [Validators.required]),
    type: this.fb.control<PrinterType>(PrinterType.Bluetooth, [Validators.required]),
  };
  printers = signal<IPrinterSearchRow[]>([]);
  currentPrinter = signal<IPrinterSearchRow | null>(null);
  /**
   *
   */
  constructor() {
    super();
    this.updatePrintersList();
  }

  fg = this.fb.group(this.printerFg);
  printerService = inject(PrinterService);

  onSubmit() {
    if (this.fg.invalid) {
      return;
      this.fg.markAllAsTouched();
    }

    switch (!!this.currentPrinter()) {
      case true:
        this.printerService.put({ id: this.currentPrinter()!.id, ...this.fg.value }).subscribe({
          next: () => this.updatePrintersList(),
        });
        break;
      case false:
        this.printerService.create(this.fg.value).subscribe({
          next: () => {
            this.updatePrintersList();
            this.onReset();
          },
        });
        break;
    }
  }
  onReset() {
    this.fg.reset();
    this.currentPrinter.set(null);
  }

  editPrinter(item: IPrinterSearchRow) {
    this.fg.patchValue(item);
    this.currentPrinter.set(item);
  }

  deletePrinter(id: number, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'هل أنت متأكد من حذف الطابعة؟',
      header: 'حذف الطابعة',
      icon: 'pi pi-info-circle',
      rejectLabel: 'إلغاء',
      rejectButtonProps: {
        label: 'إلغاء',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'حذف',
        severity: 'danger',
      },
      accept: () => {
        this.printerService.delete(id).subscribe({
          next: () => {
            this.updatePrintersList();
          },
        });
      },
      reject: () => {
        this.messageService.add({ severity: 'error', summary: 'إلغاء', detail: 'تم إلغاء الحذف' });
      },
    });
  }

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

  updatePrintersList() {
    this.getPrinters().subscribe((e) => this.printers.set(e.value.rows));
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

  //
  //
  //
  //
  //
  //
  //
  //
  //
  //
  //bluetooth printers
  //

  bluetoothPrintersDialogVisible = false;
  blueToothPrinters = signal<IBluetoothPrinter[]>([]);
  getLocalBluetoothPrinters() {
    this.printerService.getLocalBluetoothPrinters().then((e) => {
      if (e.length > 0) {
        console.log(e);
        this.blueToothPrinters.set(e);
        this.bluetoothPrintersDialogVisible = true;
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'لا يوجد اجهزة بلوتوث متصلة',
        });
      }
    });
  }

  pickBluetoothPrinter(item: IBluetoothPrinter) {
    this.fg.patchValue({
      name: item.name,
      ipAddressOrMacAddress: item.id,
      port: item.com,
      type: PrinterType.Bluetooth,
    });
    this.bluetoothPrintersDialogVisible = false;
  }
}
