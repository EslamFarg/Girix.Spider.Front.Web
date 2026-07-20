import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgSelectComponent, NgPlaceholderTemplateDirective } from '@ng-select/ng-select';
import { NgClass } from '@angular/common';
import { FormError } from '../../shared/ui/form-error/form-error';
import { getErrorMessage } from '../../shared/validations/validation-helper';
import { usernameOrEmailValidators } from '../../shared/validations/usernameOrEmailValidators';
import { AuthServices } from './services/auth-services';
import { authModel } from './models/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
// import * as CryptoJS from 'crypto-js';
// import CryptoJS from 'crypto-js';
import * as CryptoJS from 'crypto-js';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import { switchMap } from 'rxjs';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';


@Component({
  selector: 'app-auth',
  imports: [
    NgSelectComponent,
    NgPlaceholderTemplateDirective,
    NgClass,

    ReactiveFormsModule,
    FormError,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  // !!!!!!!! Services
  _fb: FormBuilder = inject(FormBuilder);
  _authServices: AuthServices = inject(AuthServices);
  _destroyRef: DestroyRef = inject(DestroyRef);
  _messageServices: MessageService = inject(MessageService);
  _router:Router=inject(Router);

  
  //user2 {
  //   "emailOrUsername": "emp1",
  //   "password": "Ma12345#",
  //   "fiscalYearId": 1,
  //   "fcmToken": "string"
  // }
  
  // !!!!!!!! Properties
  years = [2024, 2025, 2026];
  currentYear = new Date().getFullYear();

  authForm = this._fb.group({
    emailOrUsername: ['', [Validators.required, usernameOrEmailValidators()]],
    password: ['', [Validators.required, Validators.maxLength(20)]],
    fiscalYearId: [this.currentYear, [Validators.required]],
    rememberMe: [false]
  });
  isShowPassword = false;

  // !!!!!!!! Methods

  ngOnInit() {
   
     
  }

  onSubmit() {
    let data: authModel | any = {
      emailOrUsername: this.authForm.value.emailOrUsername,
      password: this.authForm.value.password,
      fiscalYearId: this.authForm.value.fiscalYearId,
    };
    const rememberMe=this.authForm.value.rememberMe;
    if (this.authForm.valid) {
      // this._authServices
      //   .login(data)
      //   .pipe(takeUntilDestroyed(this._destroyRef))
      //   .subscribe((res: any) => {
      //     console.log('data',res?.data);
      //     if(rememberMe){
      //       localStorage.setItem('erp_auth', JSON.stringify(res.data));
      //     }else{
      //       sessionStorage.setItem('erp_auth', JSON.stringify(res.data));
      //     }
      //     this._messageServices.add({ severity: 'success', summary: 'success', detail: 'تم تسجيل الدخول بنجاح' });
      //     this.authForm.reset({
      //       fiscalYearId: this.currentYear,
      //       rememberMe: false
      //     });
         
      //     this._router.navigate(['/home']);

      //     this._authServices.getForUser().pipe(takeUntilDestroyed(this._destroyRef)).subscribe((res: any) => {
      //       // console.log('data',res?.data);
      //       const secret = '188200028122003';
      
      // const encrypted = AES.encrypt(
      // JSON.stringify(res.data.applicationSettings),
      // secret
      // ).toString();
      //       localStorage.setItem('applicationSettings', encrypted);
      
      //       // decrypt
      // //             const encrypted = localStorage.getItem('applicationSettings')!;
      
      // // const bytes = CryptoJS.AES.decrypt(encrypted, secret);
      
      // // const settings = JSON.parse(
      // //   bytes.toString(CryptoJS.enc.Utf8)
      // // );
      //     });
      //   });


      this._authServices.login(data).pipe(
        switchMap((loginRes: any) => {
      
          if (rememberMe) {
            localStorage.setItem('erp_auth', JSON.stringify(loginRes.data));
          } else {
            sessionStorage.setItem('erp_auth', JSON.stringify(loginRes.data));
          }
      
          return this._authServices.getForUser();
        }),
        takeUntilDestroyed(this._destroyRef)
      ).subscribe({
        next: (res: any) => {
      
          const secret = APP_CONSTANTS.secretKey;
      
          const encrypted = AES.encrypt(
            JSON.stringify(res.data),
            secret
          ).toString();
      
          localStorage.setItem('applicationSettings', encrypted);
      
          this._router.navigate(['/home']);
        }
      });
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}
