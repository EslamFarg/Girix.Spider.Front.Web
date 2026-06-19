import { Component, effect, input, output, signal } from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ButtonDirective } from 'primeng/button';

@Component({
    selector: 'app-pos-numeric-popup',
    imports: [Dialog, ButtonDirective],
    templateUrl: './pos-numeric-popup.html',
    styleUrl: './pos-numeric-popup.css',
})
export class PosNumericPopup {
    visible = input(false);
    visibleChange = output<boolean>();
    initialValue = input(0);
    title = input('أدخل مبلغ');

    confirm = output<number>();

    draft = signal('');
    displayValue = signal('0.00');

    private readonly digitRows = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
    ];

    get rows() {
        return this.digitRows;
    }

    constructor() {
        effect(() => {
            if (!this.visible()) {
                return;
            }

            const value = this.initialValue();
            const text = value > 0 ? this.formatDraft(value) : '';
            this.draft.set(text);
            this.displayValue.set(this.formatDisplay(text));
        });
    }

    onVisibleChange(next: boolean) {
        this.visibleChange.emit(next);
    }

    onDigitPress(digit: string) {
        const next = `${this.draft()}${digit}`;
        const parsed = +next;
        if (Number.isNaN(parsed)) {
            return;
        }

        this.draft.set(next);
        this.displayValue.set(this.formatDisplay(next));
    }

    onBackspace() {
        const next = this.draft().slice(0, -1);
        this.draft.set(next);
        this.displayValue.set(this.formatDisplay(next));
    }

    onClear() {
        this.draft.set('');
        this.displayValue.set('0.00');
    }

    onConfirm() {
        const parsed = +(this.draft() || '0');
        this.confirm.emit(+Math.max(0, parsed).toFixed(2));
        this.visibleChange.emit(false);
    }

    onCancel() {
        this.visibleChange.emit(false);
    }

    private formatDraft(value: number) {
        if (value <= 0) {
            return '';
        }
        return value.toFixed(2).replace(/\.?0+$/, '');
    }

    private formatDisplay(text: string) {
        const parsed = +(text || '0');
        return Number.isNaN(parsed) ? '0.00' : parsed.toFixed(2);
    }
}
