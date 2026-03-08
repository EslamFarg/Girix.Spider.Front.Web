import { BaseComponent } from '@/components';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from "@/yn-ng";
import { InputText } from "primeng/inputtext";
import { Password } from "primeng/password";
import { Button } from "primeng/button";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-crm-login',
  imports: [InputErrorMessageHandler, InputText, Password, Button, ReactiveFormsModule, RouterLink],
  templateUrl: './crm-login.html',
  styleUrl: './crm-login.css',
})
export class CrmLogin extends BaseComponent {
  isRememberLogin = true;
  initialFormValue = {
    emailOrPhone: this.fb.control<string>('admin@admin.com', [Validators.required]),
  };

  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.sendCrmOtpToEmail(this.fg.getRawValue()).subscribe({
      next: (data) => {
        if (this.isRememberLogin) {
          this.authService.save('userDetails', data);
        }
        this.messageService.add({
          severity: 'success',
          summary: 'تم تسجيل الدخول',
          detail: 'لقد قمت بتسجيل الدخول بنجاح',
        });
      },
    });
  }
}
