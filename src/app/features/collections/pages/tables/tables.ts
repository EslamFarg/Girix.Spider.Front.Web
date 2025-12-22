import { BaseComponent } from '@/components/base-component/base-component';
import { Replacements, SpacesEnum } from '@/features/replacements/services/replacements';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator } from "primeng/paginator";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputText } from "primeng/inputtext";
import { CollectionsService } from '../../services/collections-service';

@Component({
  selector: 'app-tables',
  imports: [Paginator, InputGroupAddon, InputErrorMessageHandler, SectionWrapper, InputText,ReactiveFormsModule],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables extends BaseComponent {
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
