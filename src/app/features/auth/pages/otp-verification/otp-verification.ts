import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { ReactiveFormsModule } from '@angular/forms';
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
    email: '',
    password: '',
  };
  fg = this.fb.group(this.initialFormValue);

  isResendCountdownOver = false;

  //countdown
  countdownConfig: CountdownConfig = { format: 'ss', leftTime: 35 };
  handleCountdownEvent(event: CountdownEvent) {
    if (event.action === 'done' || event.action === 'stop') {
      console.log('done');
      this.isResendCountdownOver = true;
    }
  }
  onSubmit() {
    window.location.href = '/';
  }
}
