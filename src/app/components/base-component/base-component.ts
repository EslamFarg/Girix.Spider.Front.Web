import { AuthService } from '@/features/auth/services/auth-service';
import { LayoutService } from '@/layouts/services/layout-service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { SpacesEnum } from '@/features/replacements/services/replacements-service';
export interface IPaginationInfo {
  pageIndex: number;
  totalRowsCount: number;
  totalPagesCount: number;
}
@Component({
  selector: 'app-base-component',
  imports: [],
  templateUrl: './base-component.html',
  styleUrl: './base-component.css',
})
export class BaseComponent {
  localSpacesEnum = SpacesEnum;
  //
  nullableFb = inject(FormBuilder);
  fb = this.nullableFb.nonNullable;
  baseUrl = environment.apiUrl.replace('/v1', '');
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  translateService = inject(TranslateService);

  isLoading = this.layoutService.isLoading;

  getRowNumber = (index: number, pageNumber: number) => index + 1 + (pageNumber - 1) * 10;
  getRowsNumbers = (pageIndex: number) => (pageIndex - 1) * 10;

  getPreviousUTCDate(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  translate = (key: string) => this.translateService.instant(key);

  formatMinutesToHHMMSS(totalMinutes: number): string {
    const totalSeconds = Math.floor(totalMinutes * 60);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }
}
