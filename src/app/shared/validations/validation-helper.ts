import { AbstractControl } from '@angular/forms';
import { VALIDATION_MESSAGES } from './validation-messages';

export function getErrorMessage(
  control: AbstractControl | null,
  fieldName: string = 'This field'
): string | null {

  if (!control || !control.errors) return null;

  const firstErrorKey = Object.keys(control.errors)[0];
  const errorValue = control.errors[firstErrorKey];

  const messageFn = VALIDATION_MESSAGES[firstErrorKey];

  if (!messageFn) return 'Invalid field';

  return messageFn(fieldName, errorValue);
}