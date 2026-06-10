import { AbstractControl } from "@angular/forms";

export function EmailValidation(control: any) {
  if (!control.value) return null; // 👈 مهم جدًا

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(control.value)
    ? null
    : { invalidEmail: true };
}