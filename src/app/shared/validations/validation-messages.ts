export const VALIDATION_MESSAGES:Record<string,(fileName?:string,error?:any)=>string | null > = {
    required:(fileName="هذا الحقل")=>`${fileName} مطلوب`,
    email:(fileName="البريد الالكتروني")=>`البريد الالكتروني غير صحيح`,
      minlength: (fieldName = 'This field', error?: any) =>
    `${fieldName} must be at least ${error?.requiredLength} characters`,

  maxlength: (fieldName = 'This field', error?: any) =>
    `${fieldName} must be at most ${error?.requiredLength} characters`,

  pattern: (fieldName = 'This field') =>
    `${fieldName} has invalid format`,
}