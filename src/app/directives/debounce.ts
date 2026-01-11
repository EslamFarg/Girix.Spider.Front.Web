import { Directive, ElementRef, EventEmitter, HostListener, inject, input, Input, output, Output } from '@angular/core';
import { debounceTime, fromEvent, Subject, Subscription } from 'rxjs';

@Directive({
  selector: '[appDebounce]',
})
export class Debounce {
  debounceTime = input<number>(300);
  debounceEvent = input.required<string>();
  debounced = output();

  el = inject<ElementRef<HTMLElement>>(ElementRef);
  private sub?: Subscription;

  ngOnInit() {
    this.sub = fromEvent(this.el.nativeElement, this.debounceEvent())
      .pipe(debounceTime(this.debounceTime()))
      .subscribe((e) => this.debounced.emit());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

 

  // @HostListener('keyup.enter', ['$event'])
  // @HostListener('input', ['$event'])
  // onChange(e: Event) {
  //   if ((e.target as HTMLInputElement).value.trim() == '') {
  //     return;
  //   }
  //   this.clicks.next();
  // }
}
