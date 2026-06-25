import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActiveFilterKey {

    // activeFilterKey = signal<string | null | undefined | any>(null); 
    private key = signal<string | null | any>(null);

  readonly value = this.key.asReadonly();

  set(value: string | null) {
    this.key.set(value);
  }

  clear() {
    this.key.set(null);
  } 
}
