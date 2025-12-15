import { Directive, HostListener, input, Input } from '@angular/core';
import { BaseComponent } from '@/components/base-component/base-component';

@Directive({
  selector: '[appText]',
})
export class Text extends BaseComponent {
  constructor() {
    super();
  }

  maxLength = input<number>(250);
  minLength = input<number>(1);
  showLengthError = input<boolean>(true);

  isNumberOnly = input<boolean>(false);
  allowDecimal = input<boolean>(false);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // allow control keys (backspace, delete, arrows, tab, etc.)
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      return;
    }

    // block if not a number
    const input = event.target as HTMLInputElement;
    // if (this.allowDecimal()) {
    //   if (!/^[0-9.]$/.test(event.key)) {
    //     event.preventDefault();
    //   }

    //   if (event.key === '.' && input.value.includes('.')) {
    //     event.preventDefault();
    //   }
    // } else {

    // }

    if (this.isNumberOnly()) {
      if (!/^[0-9]$/.test(event.key)) {
        // let message = this.localize(`يمكن ادخال ارقام فقط`, `Only numbers are allowed`);
        // this.toaster.warning(message);
        event.preventDefault();
      }
    }

    // block if value exceed max
    const currentLength = input.value.length + 1;

    if (currentLength > this.maxLength()) {
      if (this.showLengthError()) {
        // let message = this.localize(`الحد الاقصى هو ${this.maxLength()}`, `Max value is ${this.maxLength()}`);
        // this.toaster.warning(message);
      }
      event.preventDefault();
    }

    if (currentLength < this.minLength()) {
      if (this.showLengthError()) {
        // let message = this.localize(
        //   `لا يمكن ادخال قيمة اقل من ${this.minLength()}`,
        //   `Value cannot be less than ${this.minLength()}`
        // );
        // this.toaster.warning(message);
      }
      event.preventDefault();
    }
  }
}
