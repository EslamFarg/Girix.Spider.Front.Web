import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

@Component({
    selector: 'app-selector-popup-shell',
    imports: [FormsModule, ButtonDirective, InputText],
    templateUrl: './selector-popup-shell.html',
    styleUrl: './selector-popup-shell.css',
})
export class SelectorPopupShell {
    title = input.required<string>();
    count = input<number>(0);
    searchTerm = input<string>('');
    searchPlaceholder = input<string>('بحث بالاسم');
    showSearch = input<boolean>(true);
    showLegend = input<boolean>(true);
    confirmLabel = input<string>('متابعة');
    cancelLabel = input<string>('إلغاء');
    confirmDisabled = input<boolean>(false);

    searchTermChange = output<string>();
    cancel = output<void>();
    confirm = output<void>();
    gridScroll = output<Event>();

    onSearchInput(value: string) {
        this.searchTermChange.emit(value);
    }
}
