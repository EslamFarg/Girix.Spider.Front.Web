import { ChangeDetectorRef, inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Observable, tap } from 'rxjs';
import { LoadingService } from '@/yn-ng/services/loading-service';

export const API_URL_OVERRIDE_STORAGE_KEY = 'apiUrlOverride';
type localStorageKey =
  | 'userDetails'
  | 'token'
  | 'forgotPasswordEmail'
  | 'forgotPasswordToken'
  | 'printers'
  | 'expireDate'
  | 'activationToken'
  | 'crmEmail'
  | typeof API_URL_OVERRIDE_STORAGE_KEY;
export interface IEndpoints {
  create: string;
  getById: string;
  delete: string;
  search: string;
  patch: string;
  put: string;
}
export default abstract class BaseService {
  private static normalizeApiBaseUrl(apiUrl: string) {
    return apiUrl.trim().replace(/\/+$/, '');
  }

  static getStoredApiBaseUrlOverride() {
    if (typeof localStorage === 'undefined') return null;

    const override = localStorage.getItem(API_URL_OVERRIDE_STORAGE_KEY);
    if (!override) return null;

    return BaseService.normalizeApiBaseUrl(override);
  }

  static getResolvedApiBaseUrl() {
    return BaseService.getStoredApiBaseUrlOverride()??'' ;//?? environment.apiUrl;
  }

  static apiBaseUrl = BaseService.getResolvedApiBaseUrl();

  static setApiBaseUrlOverride(apiUrl: string) {
    const normalizedApiUrl = BaseService.normalizeApiBaseUrl(apiUrl);
    BaseService.apiBaseUrl = normalizedApiUrl;

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(API_URL_OVERRIDE_STORAGE_KEY, normalizedApiUrl);
    }
  }

  static clearApiBaseUrlOverride() {
    BaseService.apiBaseUrl = environment.apiUrl;

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(API_URL_OVERRIDE_STORAGE_KEY);
    }
  }

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
    return localDate.toISOString().replace('Z', '');
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
