import { Directive, HostListener, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Directive({
  selector: '[appFormControlNotifier]',
})
export class FormControlNotifier {
  fc = input<AbstractControl | null>(null,{alias: 'appFormControlNotifier'});
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    this.fc()?.setValue((event.target as HTMLInputElement).value);
  }
}
