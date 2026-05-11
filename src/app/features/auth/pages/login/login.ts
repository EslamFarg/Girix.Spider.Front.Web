import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { RouterLink } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-login',
  imports: [InputErrorMessageHandler, InputTextModule, ReactiveFormsModule, PasswordModule, RouterLink, Button],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login extends BaseComponent {
  isRememberLogin = true;
  initialFormValue = {
    emailOrPhone: this.fb.control<string>('admin@admin.com', [Validators.required]),
    password: this.fb.control<string>('12345678', [Validators.required]),
  };

  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.login(this.fg.getRawValue()).subscribe({
      next: (userDetails) => {
        this.authService.userDetails.set(userDetails);
        if (this.isRememberLogin) {
          this.authService.save('userDetails', userDetails);
        }
        this.authService.router.navigate(['/']);
        this.messageService.add({
          severity: 'success',
          summary: 'تم تسجيل الدخول',
          detail: 'لقد قمت بتسجيل الدخول بنجاح',
        });
      },
    });
  }
}
