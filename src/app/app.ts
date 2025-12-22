import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { CollectionDialog } from "./features/collections/components/collection-dialog/collection-dialog";
import { ReplacementDialog } from "./features/replacements/components/replacement-dialog/replacement-dialog";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, CollectionDialog, ReplacementDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [ConfirmationService,MessageService,ConfirmDialogModule],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');
}
