import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { CountdownConfig, CountdownEvent, CountdownComponent } from 'ngx-countdown';
import { Paginator } from "primeng/paginator";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { CollectionsService } from '../../services/collections-service';
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-cabins',
  imports: [CountdownComponent, Paginator, SectionWrapper, InputErrorMessageHandler, InputGroupAddon, ReactiveFormsModule, InputText],
  templateUrl: './cabins.html',
  styleUrl: './cabins.css',
})
export class Cabins extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };

  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}

   
  //countdown
  countdownConfig: CountdownConfig = { format: 'hh:mm:ss', leftTime: 60*60*2 };
  handleCountdownEvent(event: CountdownEvent) {}

 collectionsService = inject(CollectionsService);
    openCollectionInvoiceDialog() {
      this.collectionsService.openCollectionInvoiceDialog();
    }

}
