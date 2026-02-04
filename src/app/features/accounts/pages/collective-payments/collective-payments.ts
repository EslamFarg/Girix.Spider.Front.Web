import { Component } from '@angular/core';
 import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { BaseComponent } from '@/components/base-component/base-component';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-collective-payments',
  imports: [
     SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputText,
  ],
  templateUrl: './collective-payments.html',
  styleUrl: './collective-payments.css',
})
export class CollectivePayments extends BaseComponent {
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
