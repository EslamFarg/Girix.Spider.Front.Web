import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-cabins',
  imports: [Button, ReactiveFormsModule, InputGroupAddon, InputErrorMessageHandler, Select, InputTextModule, SectionWrapper, Paginator],
  templateUrl: './cabins.html',
  styleUrl: './cabins.css',
})
export class Cabins extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);


  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}
}
