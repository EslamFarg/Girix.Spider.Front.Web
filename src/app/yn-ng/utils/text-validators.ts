import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function mustIncludeLetters(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /[a-zA-Z\u0600-\u06FF]/;
  return reg.test(control.value) ? null : { mustIncludeLetters: true };
}

export function onlyNumbersOrEnLettersAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[a-zA-Z0-9]*$/;
  return reg.test(control.value) ? null : { onlyNumbersOrEnLettersAllowed: true };
}

export function onlyNumbersAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[0-9]*$/;
  return reg.test(control.value) ? null : { onlyNumbersAllowed: true };
}

export function noSymbolsAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[a-zA-Z0-9\u0600-\u06FF\s]*$/;
  return reg.test(control.value) ? null : { noSymbolsAllowed: true };
}

export function onlyLettersAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[a-zA-Z\u0600-\u06FF\s]*$/;
  return reg.test(control.value) ? null : { onlyLettersAllowed: true };
}

export function onlyArLettersAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[\u0600-\u06FF\s]*$/;
  return reg.test(control.value) ? null : { onlyArLettersAllowed: true };
}

export function onlyEngLettersAllowed(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^[a-zA-Z\s]*$/;
  return reg.test(control.value) ? null : { onlyEngLettersAllowed: true };
}

export function emailValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(control.value) ? null : { email: true };
}

export function mobileValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const reg = /^01[0125][0-9]{8}$/;
  return reg.test(control.value) ? null : { mobile: true };
}

export function labeledRequiredValidator(messageAr: string, messageEn: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (Array.isArray(control.value)) {
      if (control.value.length > 0) return null;
    } else if (control.value) {
      return null;
    }
    return {
      labeledRequired: {
        messageAr,
        messageEn,
      },
    };
  };
}

export function labeledRegexValidator(regex: RegExp, messageAr: string, messageEn: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return regex.test(control.value) ? null : { labeledRegex: { messageAr, messageEn } };
  };
}
