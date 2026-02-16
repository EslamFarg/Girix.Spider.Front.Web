import { Directive, HostListener, input, Input } from '@angular/core';
// import { ToastrService } from 'ngx-toastr';
import { BaseComponent } from '@/components/base-component/base-component';
// import { ConsoleService } from '@ng-select/ng-select';

@Directive({
  selector: '[appAllowNumbers]',
})
export class AllowNumbers {
  @Input() max: number = Infinity;
  @Input() min: number = 0;
  @Input() fixed: number = 3;

  allowDecimal = input<boolean>(false);
  oldValue: number = 0;

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // allow control keys (backspace, delete, arrows, tab, etc.)
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(event.key)) {
      return;
    }

    // block if not a number or decimal
    const input = event.target as HTMLInputElement;

    if (this.allowDecimal()) {
      if (!/^[0-9.]$/.test(event.key)) {
        event.preventDefault();
      }

      if (event.key === '.' && input.value.includes('.')) {
        event.preventDefault();
      }
    } else {
      if (!/^[0-9]$/.test(event.key)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // let parts = input.value.split('.');
    // if (parts.length > 1) {
    //   if (parts[1].length > 2) {
    //     input.value = parts[0] + '.' + parts[1].slice(0, 2);
    //   }
    // }
    console.log('input.value', input.value);
    if (input.value.includes('.')) {
      const parts = input.value.split('.');
      console.log('parts', parts);
      if (parts[1].length > this.fixed) {
        input.value = parts[0] + '.' + parts[1].slice(0, this.fixed);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }

    if (+input.value > this.max) {
      input.value = this.max.toString();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // let message = this.localize(`الحد الاقصى هو ${this.max}`, `Max value is ${this.max}`);
      // this.toaster.warning(message);
      event.preventDefault();
      return;
    }

    if (+input.value < this.min) {
      input.value = this.min.toString();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      // let message = this.localize(`لا يمكن ادخال قيمة اقل من ${this.min}`, `Value cannot be less than ${this.min}`);
      // this.toaster.warning(message);
      event.preventDefault();
      return;
    }

    this.oldValue = +input.value;
  }
}
