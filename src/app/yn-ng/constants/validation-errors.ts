//derived type
export type ValidationErrorKey = keyof typeof ValidationErrors;

export const ValidationErrors = {
  required() {
    return { ar: 'هذا الحقل مطلوب', en: 'This field is required' };
  },
  labeledRequired(labels:{messageAr: string, messageEn: string}) {
    return {
      ar: labels.messageAr,
      en: labels.messageEn,
    };
  },
  labeledRegex(labels:{messageAr: string, messageEn: string}) {
    return {
      ar: labels.messageAr,
      en: labels.messageEn,
    };
  },
  minlength({ requiredLength, actualLength }: { requiredLength: number; actualLength: number }) {
    return {
      ar: `يجب تعبئة هذا الحقل بحد اقل ${requiredLength}`,
      en: `You must fill this field with a minimum of ${requiredLength}`,
    };
  },
  maxlength({ requiredLength, actualLength }: { requiredLength: number; actualLength: number }) {
    return {
      ar: `يجب تعبئة هذا الحقل بحد اقصي ${requiredLength}`,
      en: `You must fill this field with a maximum of ${requiredLength}`,
    };
  },
  minDate({ required, actual }: { required: Date; actual: Date }) {
    return {
      ar: `القيمة المدخلة اقل من الحد الادنى (${required.toISOString().split('T')[0]})`,
      en: `The entered value is less than the minimum value (${required.toISOString().split('T')[0]})`,
    };
  },
  maxDate({ required, actual }: { required: Date; actual: Date }) {
    return {
      ar: `القيمة المدخلة أكبر من الحد الأقصى (${required.toISOString().split('T')[0]})`,
      en: `The entered value is greater than the maximum value (${required.toISOString().split('T')[0]})`,
    };
  },
  min({ min, actual }: { min: number; actual: string }) {
    return {
      ar: `القيمة المدخلة اقل من الحد الادنى (${min})`,
      en: `The entered value is less than the minimum value (${min})`,
    };
  },
  max({ max, actual }: { max: number; actual: string }) {
    return {
      ar: `القيمة المدخلة أكبر من الحد الأقصى (${max})`,
      en: `The entered value is greater than the maximum value (${max})`,
    };
  },
  email() {
    return { ar: 'البريد الإلكتروني غير صالح', en: 'The email is not valid' };
  },
  pattern() {
    return { ar: 'القيمة غير صالحة', en: 'The value is not valid' };
  },
  mask() {
    return { ar: 'القيمة غير صالحة', en: 'The value is not valid' };
  },
  lessThanPurchasePrice() {
    return {
      ar: 'سعر البيع يجب أن يكون أكبر من سعر الشراء',
      en: 'The selling price must be greater than the purchase price',
    };
  },
  onlyNumbersAllowed() {
    return { ar: 'مسموح فقط بالارقام', en: 'Only numbers are allowed' };
  },
  mustIncludeLetters() {
    return { ar: 'يجب ان يحتوي الاسم على حرف واحد على الاقل', en: 'The name must include at least one letter' };
  },
  onlyLettersAllowed() {
    return { ar: 'مسموح فقط بالحروف', en: 'Only letters are allowed' };
  },
  noSymbolsAllowed() {
    return { ar: 'غير مسموح بالرموز', en: 'No symbols are allowed' };
  },
  onlyArLettersAllowed() {
    return { ar: 'مسموح فقط بالحروف العربية', en: 'Only Arabic letters are allowed' };
  },
  onlyEngLettersAllowed() {
    return { ar: 'مسموح فقط بالحروف الانجليزية', en: 'Only English letters are allowed' };
  },
  mobile() {
    return { ar: 'رقم الجوال غير صالح', en: 'The mobile number is not valid' };
  },
  onlyNumbersOrEnLettersAllowed() {
    return { ar: 'مسموح فقط بالارقام والحروف الانجليزية', en: 'Only numbers and English letters are allowed' };
  },
};
