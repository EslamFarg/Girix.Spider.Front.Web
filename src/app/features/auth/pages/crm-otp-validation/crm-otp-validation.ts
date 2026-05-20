import { BaseComponent } from '@/components';
import { Component, viewChild } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { InputOtp } from 'primeng/inputotp';
import { InputErrorMessageHandler } from '@/yn-ng';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-crm-otp-validation',
  imports: [InputOtp, InputErrorMessageHandler, CountdownComponent, Button, ReactiveFormsModule, RouterLink, LoadingDisabledDirective],
  templateUrl: './crm-otp-validation.html',
  styleUrl: './crm-otp-validation.css',
})
export class CrmOtpValidation extends BaseComponent {
  initialFormValue = {
    otp: this.fb.control<string>('', [Validators.required, Validators.minLength(6)]),
  };
  fg = this.fb.group(this.initialFormValue);
  currentEmail = this.authService.currentCrmEmail;
  formattedEmail = this.currentEmail.substring(0, 3) + '***' + this.currentEmail.substring(6);

  /**
   *
   */
  constructor() {
    super();
    if (!this.authService.currentCrmEmail) {
      this.router.navigate(['/auth/crm-login']);
    }

    this.fg.get('otp')?.valueChanges.pipe(debounceTime(100), takeUntilDestroyed()).subscribe((otp) => {
      console.log('otp value changed:', otp, 'valid:', this.fg.valid);
      if (otp && otp.length === 6 && this.fg.valid) {
        this.onSubmit();
      }
    });
  }

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.validateCrmOtp(this.fg.getRawValue().otp).subscribe({
      next: (result) => {
        if (result) {
          const expiryDate = new Date(result.expireDate);
          if (expiryDate <= new Date()) {
            //if expired
            this.messageService.add({
              severity: 'error',
              summary: 'تم التحقق',
              detail: `تم انتهاء صلاحية التطبيق`,
              life: 1000 * 60 * 60,
            });
          } else {
            //if not expired
            this.authService.save('expireDate', expiryDate.toISOString());
            this.router.navigate(['/auth/login']).finally(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'تم التحقق',
                detail: `تم تفعيل التطبيق حتي ${expiryDate.toLocaleString()}`,
                life: 1000 * 60 * 60,
              });
            });
          }
        }
      },
    });
  }

  //
  //
  //
  //
  //
  //
  //
  //
  // resend otp
  //
  countDown = viewChild<CountdownComponent>('countdown');
  resendOtp() {
    this.authService.resendCrmOtpToEmail().subscribe({
      next: (result) => {
        this.isResendCountdownOver = false;
        this.countDown()?.restart();
      },
    });
  }

  isResendCountdownOver = false;

  //countdown
  countdownConfig: CountdownConfig = { format: 'mm:ss', leftTime: 120 };
  handleCountdownEvent(event: CountdownEvent) {
    if (event.action === 'done' || event.action === 'stop') {
      console.log('done');
      this.isResendCountdownOver = true;
    }
  }
}
