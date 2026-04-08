import { Injectable, inject, signal } from '@angular/core';
import { MessageService } from 'primeng/api';
import BaseService from './BaseService';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiUrlOverrideService {
  private readonly messageService = inject(MessageService);

  readonly defaultApiUrl = environment.apiUrl;
  readonly normalizedDefaultApiUrl = this.normalizeApiUrl(environment.apiUrl);
  readonly isDialogVisible = signal(false);

  get currentApiUrl() {
    return BaseService.apiBaseUrl;
  }

  get isOverridden() {
    return this.currentApiUrl !== this.normalizedDefaultApiUrl;
  }

  openDialog() {
    this.isDialogVisible.set(true);
  }

  closeDialog() {
    this.isDialogVisible.set(false);
  }

  applyApiUrl(apiUrl: string) {
    const normalizedApiUrl = this.normalizeApiUrl(apiUrl);

    if (normalizedApiUrl === this.normalizedDefaultApiUrl) {
      BaseService.clearApiBaseUrlOverride();
    } else {
      BaseService.setApiBaseUrlOverride(normalizedApiUrl);
    }

    this.closeDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'API URL updated',
      detail: 'The application will reload and use the selected API URL.',
    });

    this.reloadApplication();
  }

  resetApiUrl() {
    BaseService.clearApiBaseUrlOverride();
    this.closeDialog();
    this.messageService.add({
      severity: 'success',
      summary: 'API URL reset',
      detail: 'The application will reload and use the default production API URL.',
    });

    this.reloadApplication();
  }

  private normalizeApiUrl(apiUrl: string) {
    return apiUrl.trim().replace(/\/+$/, '');
  }

  private reloadApplication() {
    setTimeout(() => window.location.reload(), 300);
  }
}
