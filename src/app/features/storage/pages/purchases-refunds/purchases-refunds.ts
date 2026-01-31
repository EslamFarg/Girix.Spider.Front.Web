import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { Select } from 'primeng/select';
import { Paginator } from 'primeng/paginator';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-purchases-refunds',
  imports: [
    InputErrorMessageHandler,
    InputGroupAddon,
    Select,
    Paginator,
    ReactiveFormsModule,
    InputTextModule,
    SectionWrapper,
  ],
  templateUrl: './purchases-refunds.html',
  styleUrl: './purchases-refunds.css',
})
export class PurchasesRefunds extends BaseComponent {
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
