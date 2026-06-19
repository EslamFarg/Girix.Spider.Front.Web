import { AuthService } from '@/features/auth/services/auth-service';
import { LayoutService } from '@/layouts/services/layout-service';
import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import BaseService from '@/core/services/BaseService';
import { TranslateService } from '@ngx-translate/core';
import { SpaceTypeEnum } from '@/features/replacements/services/replacements-service';
import { BehaviorSubject, debounceTime, Observable, Subject } from 'rxjs';
import { LoadingService } from '@/yn-ng/services/loading-service';
import { AmountType, Role } from '@/core/enums';
import { DialogService } from '@/features/dialogs/services/dialog-service';
import { DialogType } from '@/features/dialogs/enums';
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
  AmountType = AmountType;
  Role=Role;
  DialogType = DialogType;
  Math = Math;
  //
  nullableFb = inject(FormBuilder);
  fb = this.nullableFb.nonNullable;
  shallowFg = this.fb.group({});
  get baseUrl() {
    return BaseService.apiBaseUrl.replace(/\/v1$/, '');
  }
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  sanitizer = inject(DomSanitizer);
  confirmationService = inject(ConfirmationService);
  messageService = inject(MessageService);
  authService = inject(AuthService);
  // layoutService = inject(LayoutService);
  loadingService = inject(LoadingService);
  translateService = inject(TranslateService);
  dialogService = inject(DialogService);
  changeDetectionRef = inject(ChangeDetectorRef);
  dateNow = new Date();
  dateNowIso = this.dateNow.toISOString();
  debounceMap: Map<string, IDebounceMapValue> = new Map();
  isLoading = this.loadingService.isLoading;
  initialFormMode = input<FormMode>(FormMode.Create);

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

  getRowNumber = (index: number, pageNumber: number, pageSize = 10) => index + 1 + (pageNumber - 1) * pageSize;
  getCurrentRowsIx = (pageIndex: number , pageSize:number = 10) => (pageIndex - 1) * pageSize;

  getPreviousLocalDateIso(days: number) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    date.setMinutes(date.getMinutes() - new Date().getTimezoneOffset());
    return date;
  }

  get localDateIso() {
    const localDate = new Date();
    localDate.setMinutes(localDate.getMinutes() - new Date().getTimezoneOffset());
    return localDate.toISOString().replace('Z', '');
  }
  UtcToLocalIso(utcDateString: string) {
    const localDate = new Date(utcDateString);
    localDate.setMinutes(localDate.getMinutes() - new Date().getTimezoneOffset());
    return localDate.toISOString();
  }

  translate = (key: string) => this.translateService.instant(key);
  currentLang = this.translateService.getCurrentLang();
  localize = (valueAr: any, valueEn: any) => {
    return this.currentLang === 'ar' ? valueAr : valueEn;
  };

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

  getFormControl(form: FormGroup, controlName: string) {
    return form.controls[controlName] as FormControl;
  }
  
}
