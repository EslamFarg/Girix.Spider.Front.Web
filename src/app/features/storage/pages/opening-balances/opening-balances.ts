import { Component } from '@angular/core';
import { OpeningBalancesNav } from "../../components/opening-balances-nav/opening-balances-nav";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator } from "primeng/paginator";
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-opening-balances',
  imports: [OpeningBalancesNav, InputGroupAddon, InputErrorMessageHandler, Select, Paginator, ReactiveFormsModule, InputTextModule, SectionWrapper],
  templateUrl: './opening-balances.html',
  styleUrl: './opening-balances.css',
})
export class OpeningBalances  extends BaseComponent {
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
