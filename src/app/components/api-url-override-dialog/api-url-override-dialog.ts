import { Component, effect, inject, input } from '@angular/core';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '@/components/base-component/base-component';
import { ApiUrlOverrideService } from '@/core/services/api-url-override-service';

@Component({
  selector: 'app-api-url-override-dialog',
  imports: [ReactiveFormsModule, Dialog, InputTextModule, ButtonModule],
  templateUrl: './api-url-override-dialog.html',
})
export class ApiUrlOverrideDialog extends BaseComponent {
  readonly warningText = input('Developer only: changing the API URL here will switch this browser session to another backend.');

  readonly apiUrlOverrideService = inject(ApiUrlOverrideService);

  readonly apiUrlForm = this.fb.group({
    apiUrl: this.fb.control(this.apiUrlOverrideService.currentApiUrl, [Validators.required, this.apiUrlValidator]),
  });

  private readonly syncFormEffect = effect(() => {
    if (this.apiUrlOverrideService.isDialogVisible()) {
      this.apiUrlForm.reset({ apiUrl: this.apiUrlOverrideService.currentApiUrl });
    }
  });

  apiUrlValidator(control: AbstractControl<string | null>): ValidationErrors | null {
    const value = control.value?.trim();

    if (!value) return null;

    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return { invalidApiUrl: true };
      }

      return null;
    } catch {
      return { invalidApiUrl: true };
    }
  }

  get apiUrlControl() {
    return this.apiUrlForm.controls.apiUrl;
  }

  submit() {
    if (this.apiUrlForm.invalid) {
      this.apiUrlForm.markAllAsTouched();
      return;
    }

    this.apiUrlOverrideService.applyApiUrl(this.apiUrlControl.getRawValue());
  }
}
