import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class LanguageNameValidator {

  // يقبل حروف عربية ومسافات فقط
  static arabicOnly(): ValidatorFn {
    const regex = /^[\u0600-\u06FF\s]+$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();

      if (!value) {
        return null;
      }

      return regex.test(value)
        ? null
        : { arabicOnly: true };
    };
  }

  // يقبل حروف إنجليزية ومسافات فقط
  static englishOnly(): ValidatorFn {
    const regex = /^[A-Za-z\s]+$/;

    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value?.trim();

      if (!value) {
        return null;
      }

      return regex.test(value)
        ? null
        : { englishOnly: true };
    };
  }

}