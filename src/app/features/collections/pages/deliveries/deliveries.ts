import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CollectionsService } from '../../services/collections-service';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Paginator } from 'primeng/paginator';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-deliveries',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Paginator,
    ReactiveFormsModule,
    InputText,
    Select,
    Dialog,
    Button,
  ],
  templateUrl: './deliveries.html',
  styleUrl: './deliveries.css',
})
export class Deliveries extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}

  isCollectionDialogVisible = false;
  openCollectionDialog() {
    this.isCollectionDialogVisible = true;
  }
  closeCollectionDialog() {
    this.isCollectionDialogVisible = false;
  }
}
