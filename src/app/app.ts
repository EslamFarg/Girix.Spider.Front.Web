import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet,ConfirmDialogModule,ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [ConfirmationService,MessageService,ConfirmDialogModule],
})
export class App {
  protected readonly title = signal('restaurant-dashboard-angular');
}
