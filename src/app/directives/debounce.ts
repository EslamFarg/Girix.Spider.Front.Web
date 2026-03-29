import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  input,
  Input,
  output,
  Output,
  OutputEmitterRef,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, fromEvent, map, merge, Observable, Subject, Subscription } from 'rxjs';
import { outputToObservable } from '@angular/core/rxjs-interop';

export interface IDebounceEvent<T = any> {
  key: string;
  type: string;
  value: T;
}

@Directive({
  selector: '[appDebounce]',
})
export class Debounce {
  debounceTime = input<number>(300);

  // DOM events
  domEvents = input<string[]>([]);

  // Angular outputs / EventEmitters
  customEvents = input<{ type: string; key?: string; value: OutputEmitterRef<any> }[]>([]);

  debounced = output<any>();

  el = inject(ElementRef<HTMLElement>);
  private sub?: Subscription;

  ngOnInit() {
    const domEvents = this.domEvents().map((domEvent) =>
      fromEvent(this.el.nativeElement, domEvent).pipe(map((value) => ({ type: domEvent, value }))),
    );

    const customEvents = this.customEvents().map((customEvent) =>
      outputToObservable(customEvent.value).pipe(map((v) => ({ type: customEvent.type, value: v }))),
    );

    this.sub = merge(...domEvents, ...customEvents)
      .pipe(debounceTime(this.debounceTime()))
      .subscribe((e) => {
        console.log('debounced', e);
        this.debounced.emit(e);
      });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}
