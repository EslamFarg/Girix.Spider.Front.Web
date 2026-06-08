import { Directive, ElementRef, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appSpaceTrimmer]',
    host: {
        '(input)': 'onInput($event)',
    },
})
export class SpaceTrimmer {
    ref = inject(NgControl);

    onInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.ref?.control?.setValue(target?.value?.trim());
    }
}
