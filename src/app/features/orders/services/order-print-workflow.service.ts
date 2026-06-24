import { inject, Injectable } from '@angular/core';
import { forkJoin, Observable, of, switchMap } from 'rxjs';
import { IOrderBillReadResponse } from '../types/api/read';
import { ReceiptTemplateService } from './receipt-template-service';
import { AppPrinterType, IPrintJob, PrinterService } from '@/features/printers';
import {
  IPrinterSettingsReadResponse,
  PrinterSettingsService,
} from '@/features/printers/services/printer-settings-service';
import { RestaurantInfoService } from '@/features/settings/services/restaurant-info-service';
import { MessageService } from 'primeng/api';

/** Shared invoice print workflow for Collections screens and invoice preview dialogs. */
@Injectable({ providedIn: 'root' })
export class OrderPrintWorkflowService {
  private receiptTemplateService = inject(ReceiptTemplateService);
  private printerSettingsService = inject(PrinterSettingsService);
  private restaurantInfoService = inject(RestaurantInfoService);
  private printService = inject(PrinterService);
  private messageService = inject(MessageService);

  /** Preload printer settings (same as Cashier init). */
  preloadPrinterSettings(): void {
    if (!this.printerSettingsService.printerSettings()) {
      this.printerSettingsService.getSettings().subscribe();
    }
  }

  private ensurePrinterSettings(): Observable<IPrinterSettingsReadResponse> {
    const cached = this.printerSettingsService.printerSettings();
    if (cached) {
      return of(cached);
    }
    return this.printerSettingsService.getSettings();
  }

  /**
   * Customer invoice (captain) + Cashier invoice — matches Collections UX requirement.
   */
  buildCustomerAndCashierJobs(
    bill: IOrderBillReadResponse,
    settings: IPrinterSettingsReadResponse,
    restaurantName: string,
  ): IPrintJob[] {
    const jobs: IPrintJob[] = [];

    if (settings.captionOrderPrinter?.id) {
      const receipt = this.receiptTemplateService.generateCaptainReceiptHtml(
        bill,
        bill.items,
        restaurantName,
      );
      jobs.push({
        printer: {
          id: settings.captionOrderPrinter.id,
          name: settings.captionOrderPrinter.name,
          ipAddressOrMacAddress: settings.captionOrderPrinter.ipAddressOrMacAddress,
          port: settings.captionOrderPrinter.port,
          type: settings.captionOrderPrinter.type,
          comPort: settings.captionOrderPrinter.comPort,
          appPrinterType: AppPrinterType.captionOrderPrinter,
        },
        html: receipt.html,
        css: receipt.css,
      });
    }

    if (settings.cashierPrinter?.id) {
      const receipt = this.receiptTemplateService.generateCashierReceiptHtml(
        bill,
        bill.items,
        restaurantName,
      );
      jobs.push({
        printer: {
          id: settings.cashierPrinter.id,
          name: settings.cashierPrinter.name,
          ipAddressOrMacAddress: settings.cashierPrinter.ipAddressOrMacAddress,
          port: settings.cashierPrinter.port,
          type: settings.cashierPrinter.type,
          comPort: settings.cashierPrinter.comPort,
          appPrinterType: AppPrinterType.cashierPrinter,
        },
        html: receipt.html,
        css: receipt.css,
      });
    }

    return jobs;
  }

  /** Opens global printer dialog with jobs for one or more bills. */
  openPrintDialogForBills(bills: IOrderBillReadResponse[]): void {
    if (!bills.length) {
      return;
    }

    forkJoin([this.ensurePrinterSettings(), this.restaurantInfoService.getSettings()])
      .pipe(
        switchMap(([settings, restaurant]) => {
          const restaurantName = restaurant.nameAr ?? 'فاتورة كاشير';
          const jobs = bills.flatMap((bill) =>
            this.buildCustomerAndCashierJobs(bill, settings, restaurantName),
          );

          if (jobs.length === 0) {
            this.messageService.add({
              severity: 'warn',
              summary: 'تنبيه',
              detail: 'لم يتم العثور على طابعات فاتورة العميل أو الكاشير. يرجى ضبط الطابعات من الإعدادات.',
            });
            return of(null);
          }

          this.printService.openPrinterDialogWithJobs(jobs);
          return of(null);
        }),
      )
      .subscribe({
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'خطأ',
            detail: 'تعذر تحميل إعدادات الطباعة.',
          });
        },
      });
  }

  openPrintDialogForBill(bill: IOrderBillReadResponse): void {
    this.openPrintDialogForBills([bill]);
  }
}
