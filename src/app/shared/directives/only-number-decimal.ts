import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appDecimalNumber]',
  standalone: true,
})
export class DecimalNumberDirective {

  private regex: RegExp = /^\d*\.?\d{0,2}$/;

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/,/g, '.');

    if (!this.regex.test(value)) {
      value = value.slice(0, -1);
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {

    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End'
    ];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    const input = event.target as HTMLInputElement;

    // السماح بعلامة عشرية واحدة فقط
    if (event.key === '.') {
      if (input.value.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    // السماح بالأرقام فقط
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text') ?? '';

    if (!this.regex.test(pasted)) {
      event.preventDefault();
    }
  }
}