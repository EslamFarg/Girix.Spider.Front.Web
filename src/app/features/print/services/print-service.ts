import BaseService from '@/core/services/BaseService';
import { IOrderBillReadResponse, IOrderReadItem, IOrderReadResponse } from '@/features/orders';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PrintService extends BaseService {
  printOrder(html: string, css: string) {
    this.loadingService.addLoading();

    window.electronAPI
      .print({ html, css })
      .then((e) => {
        console.log(e);
      })
      .catch((e) => console.log(e))
      .finally(() => this.loadingService.removeLoading());
  }
}
