import { Directive, HostListener, Input, input } from '@angular/core';

@Directive({
    selector: '[appAllowNumbers]',
    host: {
        '(keydown)': 'onKeyDown($event)',
        '(input)': 'onInput($event)'
    }
})
export class AllowNumbers {
    @Input() max: number = Infinity;
    @Input() min: number = 0;
    @Input() fixed: number = 3;

    allowDecimal = input<boolean>(false);

    private isUpdating = false;

    onKeyDown(event: KeyboardEvent) {
        if ((event.ctrlKey || event.metaKey) && ['c', 'v', 'x', 'a'].includes(event.key.toLowerCase())) {
            return;
        }

        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'NumpadEnter'].includes(event.key)) {
            return;
        }

        const key = event.key;
        const isDigit = /^[0-9]$/.test(key);
        const isDecimalSeparator = key === '.' || key === ',';

        if (this.allowDecimal()) {
            if (!isDigit && !isDecimalSeparator) {
                event.preventDefault();
            }
        } else {
            if (!isDigit) {
                event.preventDefault();
            }
        }
    }

    onInput(event: Event) {
        if (this.isUpdating) {
            return;
        }

        const input = event.target as HTMLInputElement;
        let value = input.value;

        if (this.allowDecimal()) {
            value = this.sanitizeDecimal(value);
        } else {
            value = value.replace(/[^0-9]/g, '');
        }

        const numeric = value === '' ? 0 : Number(value);

        if (!Number.isNaN(numeric)) {
            if (numeric > this.max) {
                value = String(this.max);
            } else if (numeric < this.min) {
                value = String(this.min);
            }
        }

        if (value !== input.value) {
            this.isUpdating = true;
            input.value = value;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            this.isUpdating = false;
        }
    }

    private sanitizeDecimal(value: string): string {
        let sanitized = '';
        let dotSeen = false;

        for (const char of value) {
            if (char >= '0' && char <= '9') {
                sanitized += char;
            } else if ((char === '.' || char === ',') && !dotSeen) {
                sanitized += '.';
                dotSeen = true;
            }
        }

        if (sanitized.includes('.')) {
            const [integerPart, fractionalPart = ''] = sanitized.split('.');
            if (fractionalPart.length > this.fixed) {
                sanitized = `${integerPart}.${fractionalPart.slice(0, this.fixed)}`;
            }
        }

        return sanitized;
    }
}
