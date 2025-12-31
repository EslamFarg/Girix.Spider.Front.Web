import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputText } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, InputText, RouterLink, ButtonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword extends BaseComponent {
  initialFormValue = {
    email: this.fb.control<string>('', [Validators.required, Validators.email]),
  };
  fg = this.fb.group(this.initialFormValue);

  onSubmit() {

    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.forgotPassword(this.fg.getRawValue().email).subscribe({
      next: (result) => {
        if (result === true) {
          //strictly check for boolean response
          this.router.navigate(['/auth/otp-verification']);
        }
      },
    });
  }
}
