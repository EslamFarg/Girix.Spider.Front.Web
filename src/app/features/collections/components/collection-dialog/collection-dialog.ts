import { Component, inject } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { CollectionsService } from '../../services/collections-service';

@Component({
  selector: 'app-collection-dialog',
  imports: [InputErrorMessageHandler, Button, Select, InputText, Dialog],
  templateUrl: './collection-dialog.html',
  styleUrl: './collection-dialog.css',
})
export class CollectionDialog {
  collectionsService = inject(CollectionsService);
  isCollectionInvoiceDialogVisible = this.collectionsService.isCollectionInvoiceDialogVisible;

  closeCollectionInvoiceDialog() {
    this.collectionsService.closeCollectionInvoiceDialog();
  }
}
