import { AbstractControl, ValidationErrors } from "@angular/forms";

export function usernameOrEmailValidators(){
    return (control:AbstractControl):ValidationErrors | null => {
        const value = control.value?.trim();
         if (!value) return null;
         if (value.includes('@')) {
               const emailRegex =/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              return emailRegex.test(value) ? null : { invalidEmail: true }; 
         }

         return null;
    }
}