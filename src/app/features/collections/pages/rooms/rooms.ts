import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator } from "primeng/paginator";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CollectionsService } from '../../services/collections-service';
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-rooms',
  imports: [Paginator, InputGroupAddon, InputErrorMessageHandler, SectionWrapper, ReactiveFormsModule, InputText],
  templateUrl: './rooms.html',
  styleUrl: './rooms.css',
})
export class Rooms extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}


collectionsService = inject(CollectionsService);
    openCollectionInvoiceDialog() {
      this.collectionsService.openCollectionInvoiceDialog();
    }
   

}
