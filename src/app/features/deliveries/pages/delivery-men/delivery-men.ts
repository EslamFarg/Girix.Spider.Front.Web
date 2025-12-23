import { Component } from '@angular/core';
import { DeliveriesNav } from "../../components/deliveries-nav/deliveries-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { Select } from "primeng/select";
import { Paginator } from "primeng/paginator";
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent } from '@/components/base-component/base-component';
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-delivery-men',
  imports: [DeliveriesNav, SectionWrapper, InputErrorMessageHandler, InputGroupAddon, Select, Paginator, ReactiveFormsModule, InputText],
  templateUrl: './delivery-men.html',
  styleUrl: './delivery-men.css',
})
export class DeliveryMen  extends BaseComponent {
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
