import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CollectionDialog } from './features/collections/components/collection-dialog/collection-dialog';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { KeyboardService } from './features/keyboard/services/keyboard-service';
import { PrintDialog } from './features/printers/components/print-dialog/print-dialog';
import { PrinterType } from './features/printers';

export interface IElectronPrinter {
  id: number;
  name: string;
  ipAddressOrMacAddress: string;
  port: number;
  type: PrinterType;
}

export interface IElectonPrintOptions {
  printers: IElectronPrinter[];
  html: string;
  css: string;
}

declare global {
  interface Window {
    electronAPI: {
      getPrinters: () => Promise<any[]>;
      ping: (msg: string) => Promise<string>;
      print: (opts: IElectonPrintOptions) => Promise<string[]>;
    };
  }
}
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, CollectionDialog, PrintDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');

  private translate = inject(TranslateService);
  keyboardService = inject(KeyboardService);
  router = inject(Router);

  constructor() {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setFallbackLang('ar');
    this.translate.use('ar');
    document.onclick = (event: Event) => {
      const target = event.target as HTMLInputElement;
      //if target is an input field
      if (target && target.tagName === 'INPUT' && (target.type === 'number' || target.type === 'text')) {
        // if (target.hasAttribute('noKeyboard')) return;
        this.keyboardService.currentNumbersKeyboardInput = target;
      }
    };
    //go to replacements
    // this.router.navigate(['replacements/huts']);
  }


   
}


 