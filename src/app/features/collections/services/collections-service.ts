import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CollectionsService {
  isCollectionInvoiceDialogVisible = signal(false);



  openCollectionInvoiceDialog() {
    this.isCollectionInvoiceDialogVisible.set(true);
  }

  closeCollectionInvoiceDialog() {
    this.isCollectionInvoiceDialogVisible.set(false);
  }
}
