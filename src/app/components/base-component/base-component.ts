import { AuthService } from '@/features/auth/services/auth-service';
import { LayoutService } from '@/layouts/services/layout-service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { environment } from '../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { BehaviorSubject, debounceTime, Observable, Subject } from 'rxjs';
export interface IPaginationInfo {
  pageIndex: number;
  totalRowsCount: number;
  totalPagesCount: number;
}
export enum FormMode {
  Create,
  Update,
  View,
}

export interface IDebounceMapValue<T = any> {
  subject: Subject<T>;
  callback: (e: T) => void;
}

@Component({
  selector: 'app-base-component',
  imports: [],
  templateUrl: './base-component.html',
  styleUrl: './base-component.css',
})
export class BaseComponent {
  localSpaceTypeEnum = SpaceTypeEnum;
  FormMode = FormMode;
  //
  nullableFb = inject(FormBuilder);
  fb = this.nullableFb.nonNullable;
  baseUrl = environment.apiUrl.replace('/v1', '');
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  authService = inject(AuthService);
  layoutService = inject(LayoutService);
  translateService = inject(TranslateService);
  dateNowIso = new Date().toISOString();
  debounceMap: Map<string, IDebounceMapValue> = new Map();
  setDebounceItem<T>(key: string, callback: (e: T) => void) {
    this.debounceMap.set(key, { subject: new Subject<T>(), callback });

    this.debounceMap.get(key)?.subject.pipe(debounceTime(400)).subscribe({
      next: callback,
    });
  }

  emitDebounceItem = (key: string, value: any) => this.debounceMap.get(key)?.subject.next(value);

  constructor() {
    //go through each debounceMap value and subscribe to it with 500ms debounce
  }

  ngOnDestroy() {
    this.debounceMap.forEach((value) => value.subject.complete());
  }

  isLoading = this.layoutService.isLoading;

  getRowNumber = (index: number, pageNumber: number) => index + 1 + (pageNumber - 1) * 10;
  getCurrentRowsIx = (pageIndex: number) => (pageIndex - 1) * 10;

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

  get routeId() {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    return id;
  }
}
