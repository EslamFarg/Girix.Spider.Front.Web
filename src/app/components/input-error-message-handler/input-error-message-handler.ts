import { ValidationErrorsEnum } from '@/lib/enums/validation-errors';
import { Component, input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-input-error-message-handler',
  imports: [Message],
  templateUrl: './input-error-message-handler.html',
  styleUrl: './input-error-message-handler.css',
})
export class InputErrorMessageHandler {
  fc = input<AbstractControl | null>(null);

  getErrorMessage() {
    let error = '';
    if (this.fc()?.errors) {
      let key = Object.keys(this.fc()?.errors!)[0];
      error = ValidationErrorsEnum[key](this.fc()?.errors![key]).ar;
    }
    return error;
  }
}
