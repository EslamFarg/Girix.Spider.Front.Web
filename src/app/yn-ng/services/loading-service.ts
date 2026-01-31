import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  isLoading = signal(false);
  loadingItemsCount = signal(0);

  addLoading() {
    this.loadingItemsCount.update((count) => count + 1);
    this.isLoading.set(true);
  }


  removeLoading() {
    this.loadingItemsCount.update((count) => count - 1);

    if (this.loadingItemsCount() === 0) {
      this.isLoading.set(false);
    }
  }
}
