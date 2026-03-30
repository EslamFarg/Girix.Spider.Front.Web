import { ValidationErrorKey, ValidationErrors } from '../..';
import { Component, input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { Message } from 'primeng/message';
import { InputGroupModule } from 'primeng/inputgroup';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-input-error-message-handler',
  imports: [Message, InputGroupModule, NgTemplateOutlet],
  templateUrl: './input-error-message-handler.html',
  styleUrl: './input-error-message-handler.css',
})
export class InputErrorMessageHandler {
  fc = input<AbstractControl | null>(null);
  grouped = input<boolean>(true);

  getErrorMessage() {
    let error = '';
    if (this.fc()?.errors) {
      let key = Object.keys(this.fc()?.errors!)[0] as ValidationErrorKey;
      const method = ValidationErrors[key];
      error = method(this.fc()?.errors![key]).ar;
    }
    return error;
  }
}
