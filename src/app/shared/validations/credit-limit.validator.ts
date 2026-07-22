import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function creditWarningLimitValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent) {
      return null;
    }

    const warningLimit = Number(control.value);
    const creditLimit = Number(control.parent.get('creditLimit')?.value);

    if (
      !isNaN(warningLimit) &&
      !isNaN(creditLimit) &&
      warningLimit > creditLimit
    ) {
      return {
        creditLimitExceeded: true
      };
    }

    return null;
  };
}