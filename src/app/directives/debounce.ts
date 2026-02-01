import { Directive, ElementRef, EventEmitter, HostListener, inject, input, Input, output, Output, OutputEmitterRef } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent, merge, Observable, Subject, Subscription } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';
@Directive({
  selector: '[appDebounce]',
})
export class Debounce {
  debounceTime = input<number>(300);

  // DOM events
  domEvents = input<string[]>([]);

  // Angular outputs / EventEmitters
  events$ = input<OutputEmitterRef<any>[]>([]);

  debounced = output<any>();

  el = inject(ElementRef<HTMLElement>);
  private sub?: Subscription;

  ngOnInit() {
    const dom$ = this.domEvents().map((e) => fromEvent(this.el.nativeElement, e));

    const streams = this.events$().map(e =>
      outputToObservable(e)
    );

    this.sub = merge(...dom$, ...streams )
      .pipe(debounceTime(this.debounceTime()))
      .subscribe((e) => this.debounced.emit(e));
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
