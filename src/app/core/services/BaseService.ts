import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

type localStorageKey = 'userDetails' | 'token';

export default class BaseService {
  apiUrl = environment.apiUrl;
  isMock = environment.isMock;
  http = inject(HttpClient);
  router = inject(Router);
  messageService = inject(MessageService);

  /**
   * Save/update data to localStorage
   */
  save(key: localStorageKey, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Get data from localStorage
   */
  get<T>(key: localStorageKey) {
    const item = localStorage.getItem(key);
    if (!item) return null;
    return  JSON.parse(item) as T;
  }

  /**
   * Remove data from localStorage
   */
  remove(key: localStorageKey) {
    localStorage.removeItem(key);
  }
}
