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
      this._authServices
        .login(data)
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe((res: any) => {
          console.log('data',res?.data);
          if(rememberMe){
            localStorage.setItem('erp_auth', JSON.stringify(res.data));
          }else{
            sessionStorage.setItem('erp_auth', JSON.stringify(res.data));
          }
          this._messageServices.add({ severity: 'success', summary: 'success', detail: 'تم تسجيل الدخول بنجاح' });
          this.authForm.reset({
            fiscalYearId: this.currentYear,
            rememberMe: false
          });
          this._router.navigate(['/home']);
        });
    } else {
      this.authForm.markAllAsTouched();
    }
  }
}
