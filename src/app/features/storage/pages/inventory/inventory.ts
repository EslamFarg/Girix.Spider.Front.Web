import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { Paginator } from 'primeng/paginator';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-inventory',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    DatePicker,
    InputTextModule,
    ReactiveFormsModule,
    Paginator,
    Button,
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}
}
