import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appImgFallback]',
})
export class ImgFallback {
  @Input() fallBackLink: string = '/images/placeholders/upload.jpg'; // fallback image path

  constructor(private el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError() {
    const element = this.el.nativeElement;
    if (this.fallBackLink) {
      element.src = this.fallBackLink; // set fallback
    } else {
      element.style.display = 'none'; // or just hide if no fallback
    }
  }
}
