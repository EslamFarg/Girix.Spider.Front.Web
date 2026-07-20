import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UsersStateService {
  private selectedUserId = signal<string | number | null>(null);

  readonly selectedUserId$ = this.selectedUserId.asReadonly();

  setSelectedUserId(id: string | number): void {
    this.selectedUserId.set(id);
  }

  clearSelectedUserId(): void {
    this.selectedUserId.set(null);
  }
}
