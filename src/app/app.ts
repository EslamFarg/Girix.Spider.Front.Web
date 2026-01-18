import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CollectionDialog } from "./features/collections/components/collection-dialog/collection-dialog";
import { ReplacementDialog } from "./features/replacements/components/replacement-dialog/replacement-dialog";
import {
    TranslateService,
    TranslatePipe,
    TranslateDirective
} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, CollectionDialog, ReplacementDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');

  private translate = inject(TranslateService);

    constructor() {
        this.translate.addLangs(['ar', 'en']);
        this.translate.setFallbackLang('ar');
        this.translate.use('ar');
    }
}
