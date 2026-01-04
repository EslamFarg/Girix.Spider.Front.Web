import { BaseComponent } from '@/components/base-component/base-component';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-refunds',
  imports: [
    ReactiveFormsModule,
    InputErrorMessageHandler,
    InputGroupAddon,
    InputTextModule,
    SelectModule,
    PaginatorModule,
    SectionWrapper,
  ],
  templateUrl: './refunds.html',
  styleUrl: './refunds.css',
})
export class Refunds extends BaseComponent {
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
