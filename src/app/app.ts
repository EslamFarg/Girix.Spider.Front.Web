import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TitleBar } from './components/title-bar/title-bar';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CollectionDialog } from './features/collections/components/collection-dialog/collection-dialog';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { KeyboardService } from './features/keyboard/services/keyboard-service';
import { PrintDialog } from './features/printers/components/print-dialog/print-dialog';
import { PrinterType } from './features/printers';
import { AuthService } from './features/auth/services/auth-service';

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
export interface IBluetoothPrinter {
  id: string;
  name: any;
  com: string;
  type: string;
}
declare global {
  interface Window {
    electronAPI: {
      getBluetoothPrinters: () => Promise<IBluetoothPrinter[]>;
      ping: (msg: unknown) => Promise<unknown>;
      print: (msg: IElectonPrintOptions) => Promise<string[]>;
      saveLink: (key: string, link: string) => Promise<{ key: string; link: string }>;
      getLink: (key: string) => Promise<{ key: string; link: string | null }>;
      getAllLinks: () => Promise<Record<string, string>>;

      // Window controls
      windowMinimize: () => Promise<void>;
      windowMaximize: () => Promise<void>;
      windowClose: () => Promise<void>;
      windowIsMaximized: () => Promise<boolean>;

      // Auth / Main mode switching
      setAuthMode: () => Promise<void>;
      setMainMode: () => Promise<void>;

      // Listen for maximize/unmaximize events
      onWindowMaximized: (callback: (isMaximized: boolean) => void) => () => void;
    };
  }
}
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, CollectionDialog, PrintDialog, TitleBar],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');

  private translate = inject(TranslateService);
  keyboardService = inject(KeyboardService);
  router = inject(Router);
  authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
  isElectron = signal(typeof window !== 'undefined' && !!window.electronAPI);
  constructor() {
    if (this.isElectron()) {
      document.body.classList.add('electron');
    }
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
