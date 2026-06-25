import { AbstractControl } from "@angular/forms";

export function addressValidations() {
    return (control:AbstractControl) => {
        const value = control.value;
        if(!value) return null;
       
    const startsWithValidChar = /^[a-zA-Z_\s\u0600-\u06FF]/.test(value);

    // باقي الاسم مسموح حروف + أرقام + underscore
    const validPattern = /^[a-zA-Z0-9_\s\u0600-\u06FF]+$/.test(value);

    if (!startsWithValidChar || !validPattern) {
      return { invalidUsername: true };
    }

    return null;
  };
    
}