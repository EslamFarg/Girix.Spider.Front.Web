import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appMaxPercentage]'
})
export class MaxPercentageDirective {

  constructor(
    private el: ElementRef,
    @Optional() @Self() private ngControl: NgControl
  ) {}

  @HostListener('input')
  onInput(): void {

    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value;

    if (!value) {
      return;
    }

    value = value.replace(/\s/g, '').replace(/[^0-9.]/g, '');

    const parts = value.split('.');

    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }

    if (parts[1]?.length > 1) {
      value = parts[0] + '.' + parts[1].substring(0, 1);
    }

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue) && numericValue > 100) {
      value = '100';
    }

    input.value = value;

    // تحديث الفورم كنترول
    this.ngControl?.control?.setValue(value, {
      emitEvent: false
    });
  }
}