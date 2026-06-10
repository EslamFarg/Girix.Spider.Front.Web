import { AbstractControl, ValidationErrors } from '@angular/forms';

export function egyptSaudiPhoneValidator(control: AbstractControl): ValidationErrors | null {
  let value = control.value;

  if (!value) return null;

  value = value.replace(/\s+/g, '');

  // Egypt
  const egyptLocal = /^01[0-2,5][0-9]{8}$/;
  const egyptIntl = /^\+201[0-2,5][0-9]{8}$/;

  // Saudi
  const saudiLocal = /^05[0-9]{8}$/;
  const saudiIntl = /^\+9665[0-9]{8}$/;

  // 🎯 تحديد الدولة من الرقم
  if (value.startsWith('01') || value.startsWith('+20')) {
    const isValidEgypt = egyptLocal.test(value) || egyptIntl.test(value);

    if (!isValidEgypt) {
      return { invalidEgyptPhone: true };
    }

    return null;
  }

  if (value.startsWith('05') || value.startsWith('+966')) {
    const isValidSaudi = saudiLocal.test(value) || saudiIntl.test(value);

    if (!isValidSaudi) {
      return { invalidSaudiPhone: true };
    }

    return null;
  }

  // ❌ لو مش معروف الدولة
  return { invalidPhone: true };
}