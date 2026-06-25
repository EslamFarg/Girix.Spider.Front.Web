import { AbstractControl } from "@angular/forms";

export function entityNameValidator(){
    return (control:AbstractControl) => {
        const value = control.value;
        if(!value) return null;
        const startsWithValidChar = /^[a-zA-Z_\s\u0600-\u06FF]/.test(value);
        const validPattern = /^[a-zA-Z0-9_\s\u0600-\u06FF]+$/.test(value);
        if (!startsWithValidChar || !validPattern) {
            return { invalidEntityName: true };
        }
        return null;
    }
}