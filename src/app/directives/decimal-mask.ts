import { AfterViewInit, Directive, ElementRef, HostListener, inject, input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appDecimalMask]',
})
export class DecimalMask implements OnInit, AfterViewInit, OnDestroy {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private ngControl = inject(NgControl, { optional: true, self: true });

  decimalPlaces = input<number>(2);
  private valueChangesSub?: Subscription;
  private isFocused = false;

  private getRawValue(): number | null {
    if (this.ngControl?.control) {
      return this.ngControl.control.value ?? null;
    }
    const val = parseFloat(this.el.nativeElement.value);
    return isNaN(val) ? null : val;
  }

  private formatValue(value: number | null): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }
    return value.toFixed(this.decimalPlaces());
  }

  private applyMask() {
    if (this.isFocused) return;
    this.renderer.setAttribute(this.el.nativeElement, 'type', 'text');
    const raw = this.getRawValue();
    this.el.nativeElement.value = this.formatValue(raw);
  }

  ngOnInit() {
    this.applyMask();

    // Re-apply mask when value changes programmatically
    if (this.ngControl?.control) {
      this.valueChangesSub = this.ngControl.control.valueChanges.subscribe(() => {
        this.applyMask();
      });
    }
  }

  ngAfterViewInit() {
    this.applyMask();
  }

  ngOnDestroy() {
    this.valueChangesSub?.unsubscribe();
  }

  @HostListener('focus')
  onFocus() {
    this.isFocused = true;
    this.renderer.setAttribute(this.el.nativeElement, 'type', 'number');
    const raw = this.getRawValue();
    this.el.nativeElement.value = raw !== null && raw !== undefined ? String(raw) : '';
  }

  @HostListener('blur')
  onBlur() {
    this.isFocused = false;
    this.applyMask();
  }
}
