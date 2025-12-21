import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { Dialog } from "./features/replacements/components/dialog/dialog";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ConfirmDialogModule, ToastModule, Dialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [ConfirmationService,MessageService,ConfirmDialogModule],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');
}
