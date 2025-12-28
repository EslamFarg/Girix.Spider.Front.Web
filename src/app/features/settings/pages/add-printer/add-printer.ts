import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputText } from "primeng/inputtext";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { Button } from "primeng/button";
import { Paginator } from "primeng/paginator";
import { BaseComponent } from '@/components/base-component/base-component';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-add-printer',
  imports: [SectionWrapper, InputText, InputErrorMessageHandler, InputGroupAddon, Button, Paginator],
  templateUrl: './add-printer.html',
  styleUrl: './add-printer.css',
})
export class AddPrinter  extends BaseComponent {
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
