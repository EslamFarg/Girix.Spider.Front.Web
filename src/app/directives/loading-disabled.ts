import { Directive, effect, ElementRef, inject, Renderer2 } from '@angular/core';
import { LoadingService } from '@/yn-ng/services/loading-service';

@Directive({
  selector: '[appLoadingDisabled]',
})
export class LoadingDisabledDirective {
  private loadingService = inject(LoadingService);
  private el = inject(ElementRef<HTMLElement>);
  private renderer = inject(Renderer2);

  constructor() {
    // Create the overlay element once
    const overlay = this.renderer.createElement('div');
    this.renderer.addClass(overlay, 'loading-disabled-overlay');
    this.renderer.appendChild(this.el.nativeElement, overlay);

    // Reactively toggle the loading-disabled class based on service state
    effect(() => {
      const isLoading = this.loadingService.isLoading();
      const nativeEl = this.el.nativeElement;

      if (isLoading) {
        this.renderer.addClass(nativeEl, 'loading-disabled');
        this.renderer.setAttribute(nativeEl,'disabled', 'true');
        this.renderer.setStyle(nativeEl, 'pointer-events', 'none');
      } else {
        this.renderer.removeAttribute(nativeEl, 'disabled');
        this.renderer.removeClass(nativeEl, 'loading-disabled');
        this.renderer.removeStyle(nativeEl, 'pointer-events');
      }
    });
  }
}
