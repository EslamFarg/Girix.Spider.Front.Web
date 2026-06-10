import { ValidatorFn } from "@angular/forms";

export function noLeadingSpaces(): ValidatorFn  {

    return (control) => {
        const value = control.value;
        if (value && value.trim() !== value) {
            return { leadingSpace: true };
        }
        return null;
    }
    
}
