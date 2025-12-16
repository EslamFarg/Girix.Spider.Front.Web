import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PaginatorModule } from 'primeng/paginator';


@Component({
  selector: 'app-orders',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, InputGroupAddon,InputTextModule,SelectModule,PaginatorModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders extends BaseComponent {
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
