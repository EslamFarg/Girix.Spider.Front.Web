import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, Password, Button, InputText],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword extends BaseComponent {
  isRememberMe = false;
  initialFormValue = {
    newPassword: this.fb.control<string>('P@ssw0rd', [Validators.required]),
    confirmPassword: this.fb.control<string>('P@ssw0rd', [Validators.required]),
  };

  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid || this.fg.value.newPassword !== this.fg.value.confirmPassword) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.changePassword(this.fg.getRawValue()).subscribe({
      next: (data) => {
        this.router.navigate(['/auth/login']);
        this.messageService.add({
          severity: 'success',
          summary: 'تم تغيير كلمة المرور',
          detail: 'لقد قمت بتغيير كلمة المرور بنجاح',
        });
      },
    });
  }
}
