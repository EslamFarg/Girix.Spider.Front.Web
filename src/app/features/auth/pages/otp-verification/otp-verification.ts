import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputOtpModule } from 'primeng/inputotp';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';

@Component({
  selector: 'app-otp-verification',
  imports: [InputErrorMessageHandler, Button, ReactiveFormsModule, RouterLink, InputOtpModule, CountdownComponent],
  templateUrl: './otp-verification.html',
  styleUrl: './otp-verification.css',
})
export class OtpVerification extends BaseComponent {
  initialFormValue = {
    otp: this.fb.control<string>('', [Validators.required, Validators.minLength(6)]),
  };
  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.validateOtp(this.fg.getRawValue().otp).subscribe({
      next: (result) => {
        if (result.token) {
          //strictly check for boolean response
          this.router.navigate(['/auth/reset-password']);
        }
      },
    });
  }

  isResendCountdownOver = false;

  //countdown
  countdownConfig: CountdownConfig = { format: 'ss', leftTime: 35 };
  handleCountdownEvent(event: CountdownEvent) {
    if (event.action === 'done' || event.action === 'stop') {
      console.log('done');
      this.isResendCountdownOver = true;
    }
  }
}
