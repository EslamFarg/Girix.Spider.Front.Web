import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';

@Component({
  selector: 'app-change-password',
  imports: [
    SectionWrapper,
    ReactiveFormsModule,
    InputErrorMessageHandler,
    Password,
    Button,
    LoadingDisabledDirective,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword extends BaseComponent {
  initialFormValue = {
    newPassword: this.fb.control<string>('', [Validators.required]),
    confirmPassword: this.fb.control<string>('', [Validators.required]),
  };

  fg = this.fb.group(this.initialFormValue);

  onSubmit() {
    if (this.fg.invalid || this.fg.value.newPassword !== this.fg.value.confirmPassword) {
      this.fg.markAllAsTouched();
      return;
    }

    this.authService.changePassword(this.fg.getRawValue()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'تم تغيير كلمة المرور',
          detail: 'لقد قمت بتغيير كلمة المرور بنجاح',
        });
        this.fg.reset();
      },
    });
  }
}
