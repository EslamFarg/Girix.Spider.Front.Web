import { Directive, ElementRef, inject, input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
    selector: '[appSpaceTrimmer]',
    host: {
        '(input)': 'onInput($event)',
    },
})
export class SpaceTrimmer {
    private ref = inject(NgControl, { optional: true });
    private el = inject(ElementRef);

    // القيمة الافتراضية الآن هي 0 (منع المسافات تماماً)
    maxSpaces = input<number>(0);

    onInput(event: Event) {
        const inputEl = this.el.nativeElement as HTMLInputElement;
        const originalValue = inputEl.value;
        const limit = this.maxSpaces();

        let sanitizedValue = originalValue;

        if (limit === 0) {
            // إذا كان الحد 0: إزالة جميع أنواع المسافات فوراً من النص كاملًا
            sanitizedValue = originalValue.replace(/\s/g, '');
        } else {
            // إذا كان الحد 1 أو أكثر: إنشاء تعبير نمطي ديناميكي للمسافات المتتالية
            const regex = new RegExp(`\\s{${limit + 1},}`, 'g');
            const replacement = ' '.repeat(limit);
            sanitizedValue = originalValue.replace(regex, replacement).trimStart();
        }

        if (originalValue !== sanitizedValue) {
            // حفظ موضع المؤشر لتجنب قفزه أثناء الكتابة
            const start = inputEl.selectionStart;
            const end = inputEl.selectionEnd;
            
            // تحديث الواجهة وقيمة النموذج
            inputEl.value = sanitizedValue;
            this.ref?.control?.setValue(sanitizedValue, { emitEvent: false });
            
            // حساب الموضع الجديد للمؤشر بعد إزالة المسافات الزائدة
            const offset = originalValue.length - sanitizedValue.length;
            const newPosition = Math.max(0, (start ?? 0) - offset);
            inputEl.setSelectionRange(newPosition, newPosition);
        }
    }
}
