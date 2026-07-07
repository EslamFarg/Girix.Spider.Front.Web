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

// السماح بنقطة واحدة فقط
const firstDotIndex = value.indexOf('.');

if (firstDotIndex !== -1) {
  value =
    value.substring(0, firstDotIndex + 1) +
    value.substring(firstDotIndex + 1).replace(/\./g, '');
}

const parts = value.split('.');

// السماح برقم واحد فقط بعد العلامة العشرية
if (parts.length === 2 && parts[1].length > 1) {
  value = parts[0] + '.' + parts[1].substring(0, 1);
}

let numericValue = parseFloat(value);

// لو القيمة 100 أو أكبر، اجعلها 100 فقط بدون نقطة
if (!isNaN(numericValue) && numericValue >= 100) {
  value = '100';
}

input.value = value;

this.ngControl?.control?.setValue(value, {
  emitEvent: false,
});
  }
}