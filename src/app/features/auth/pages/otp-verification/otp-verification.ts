import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Button } from "primeng/button";
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { InputOtpModule } from 'primeng/inputotp';

@Component({
  selector: 'app-otp-verification',
  imports: [InputErrorMessageHandler, Button, ReactiveFormsModule, RouterLink,InputOtpModule],
  templateUrl: './otp-verification.html',
  styleUrl: './otp-verification.css',
})
export class OtpVerification  extends BaseComponent {
  initialFormValue = {
    email: '',
    password: ''
  };
  fg  = this.fb.group(this.initialFormValue);



  onSubmit() {
    window.location.href = '/';
  }
}
