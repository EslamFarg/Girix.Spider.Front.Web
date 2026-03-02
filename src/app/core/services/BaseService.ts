import { ChangeDetectorRef, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '@/yn-ng/services/loading-service';

type localStorageKey = 'userDetails' | 'token' | 'forgotPasswordEmail' | 'forgotPasswordToken' | 'printers';
export interface IEndpoints {
  create: string;
  getById: string;
  delete: string;
  search: string;
  patch: string;
  put: string;
}
export default abstract class BaseService {
  static apiBaseUrl = environment.apiUrl;
  loadingService = inject(LoadingService);
  apiRoute = '';
  get apiUrl() {
    return `${BaseService.apiBaseUrl}/${this.apiRoute}`;
  }
  isMock = environment.isMock;

  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);

  endpoints: IEndpoints = {
    create: 'Create',
     put: '',
    getById: '/',
    delete: '',
    search: 'Search',
    patch: '',
  };

  get localDateIso() {
    const localDate = new Date();
    localDate.setMinutes(localDate.getMinutes() - new Date().getTimezoneOffset());
    return localDate.toISOString();
  }
  protected patchEndpoints(endpoints: Partial<IEndpoints>) {
    this.endpoints = { ...this.endpoints, ...endpoints };
  }
  //
  //local storage
  //

  /**
   * Save/update data to localStorage
   */
  save = (key: localStorageKey, data: any) => localStorage.setItem(key, JSON.stringify(data));

  /**
   * Get data from localStorage
   */
  get<T>(key: localStorageKey) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return JSON.parse(item) as T;
  }

  /**
   * Remove data from localStorage
   */
  remove = (key: localStorageKey) => localStorage.removeItem(key);
}
