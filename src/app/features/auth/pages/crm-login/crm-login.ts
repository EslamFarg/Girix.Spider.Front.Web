import { BaseComponent } from '@/components';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, InputErrorMessageHandler } from '@/yn-ng';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-crm-login',
  imports: [InputErrorMessageHandler, InputText, Password, Button, ReactiveFormsModule, RouterLink, LoadingDisabledDirective],
  templateUrl: './crm-login.html',
  styleUrl: './crm-login.css',
})
export class CrmLogin extends BaseComponent {
  isRememberLogin = true;
  initialFormValue = {
    emailOrPhone: this.fb.control<string | null>(null, [Validators.required, Validators.email, emailValidator]),
  };

  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.sendCrmOtpToEmail(this.fg.getRawValue().emailOrPhone!).subscribe({
      next: (data) => {
        console.log(data);
        this.router.navigate(['/auth/crm-otp-validation']);
      },
    });
  }
}
