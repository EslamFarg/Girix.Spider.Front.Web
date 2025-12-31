import { signal } from "@angular/core";
import BaseService from "../services/BaseService";

export class BaseLayoutService extends BaseService {
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