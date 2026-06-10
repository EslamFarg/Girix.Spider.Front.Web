import { Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  imports: [],
  templateUrl: './form-error.html',
  styleUrl: './form-error.scss',
})
export class FormError {

  control=input<AbstractControl | null>(null)
  errorKey=input<string>('')
  message=input<string>('')


  
}
