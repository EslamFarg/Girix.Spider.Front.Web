import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { Paginator, PaginatorState } from "primeng/paginator";
import { HutService, IHutRowResponse } from '../../services/hut-service';

@Component({
  selector: 'app-huts',
  imports: [Button, ReactiveFormsModule, InputGroupAddon, InputErrorMessageHandler, Select, InputTextModule, SectionWrapper, Paginator],
  templateUrl: './huts.html',
  styleUrl: './huts.css',
})
export class Huts extends BaseComponent<IHutRowResponse> {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  hutService=inject(HutService);

  constructor() {
    super();

    this.hutService.resetSearchRequestModel();

    //get page 1 of 10 orders
    this.hutService.search().subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  onSubmit() {}

  first = 0;
  rows = 10;
   onPageChange(event: PaginatorState) {
    console.log(event);
    this.hutService.search({ pageIndex: event.page! + 1 }).subscribe({
      next: (res) => {
        this.items.set(res.value.rows);
      },
    });
  }

}
