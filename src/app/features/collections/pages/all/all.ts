import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { CollectionsService } from '../../services/collections-service';

@Component({
  selector: 'app-all',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Dialog,
    Button,
  ],
  templateUrl: './all.html',
  styleUrl: './all.css',
})
export class All extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  onSubmit() {}

  first = 0;

  rows = 10;
  onPageChange(event: any) {}

  collectionsService = inject(CollectionsService);
  openCollectionInvoiceDialog() {
    this.collectionsService.openCollectionInvoiceDialog();
  }

  isInvoiceTypeChangeDialogVisible = false;

  openInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = true;
  }

  closeInvoiceTypeChangeDialog() {
    this.isInvoiceTypeChangeDialogVisible = false;
  }
}
