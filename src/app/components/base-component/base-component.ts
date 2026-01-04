import { AuthService } from '@/features/auth/services/auth-service';
import { LayoutService } from '@/layouts/services/layout-service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-base-component',
  imports: [],
  templateUrl: './base-component.html',
  styleUrl: './base-component.css',
})
export class BaseComponent<ItemType = any> {
  nullableFb = inject(FormBuilder);
  fb = this.nullableFb.nonNullable;
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);

  items = signal<ItemType[]>([]);
  getRowNumber = (index: number,pageNumber: number) => (index + 1) + ((pageNumber - 1) * 10);
}
