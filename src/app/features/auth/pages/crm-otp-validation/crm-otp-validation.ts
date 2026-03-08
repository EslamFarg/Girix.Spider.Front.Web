import { BaseComponent } from '@/components';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { InputOtp } from "primeng/inputotp";
import { InputErrorMessageHandler } from "@/yn-ng";
import { Button } from "primeng/button";

@Component({
  selector: 'app-crm-otp-validation',
  imports: [InputOtp, InputErrorMessageHandler, CountdownComponent, Button,ReactiveFormsModule],
  templateUrl: './crm-otp-validation.html',
  styleUrl: './crm-otp-validation.css',
})
export class CrmOtpValidation  extends BaseComponent {
  initialFormValue = {
    otp: this.fb.control<string>('', [Validators.required, Validators.minLength(6)]),
  };
  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.validateCrmOtp(this.fg.getRawValue().otp).subscribe({
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
