import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CollectiveReceiptForm } from "../../components/collective-receipt-form/collective-receipt-form";
import { CollectiveReceiptsNav } from "../../components/collective-receipts-nav/collective-receipts-nav";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { Select } from "primeng/select";
import { Paginator } from "primeng/paginator";
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-collective-receipts',
  imports: [SectionWrapper, ReactiveFormsModule, InputErrorMessageHandler, InputGroupAddon, Select, Paginator, InputText, CollectiveReceiptsNav],
  templateUrl: './collective-receipts.html',
  styleUrl: './collective-receipts.css',
})
export class CollectiveReceipts extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);



  periodOptions=[
    {label:'اليوم',value:1},
    {label:'الاسبوع',value:2},
    {label:'الشهر',value:3},
    {label:'السنة',value:4},
  ]

  onSubmit() {}


  first = 0;
  rows = 10;
  onPageChange(event: any) {}

}
