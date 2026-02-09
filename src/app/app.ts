import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CollectionDialog } from './features/collections/components/collection-dialog/collection-dialog';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';

declare global {
  interface Window {
    electronAPI: {
      getPrinters: () => Promise<any[]>;
      ping: (msg: string) => Promise<string>;
      print: (html: string) => Promise<string>;
    };
  }
}
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, CollectionDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');

  private translate = inject(TranslateService);
  router = inject(Router);

  constructor() {
    this.translate.addLangs(['ar', 'en']);
    this.translate.setFallbackLang('ar');
    this.translate.use('ar');

    //go to replacements
    // this.router.navigate(['replacements/huts']);
  }
}
