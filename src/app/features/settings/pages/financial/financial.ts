import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-financial',
  imports: [InputErrorMessageHandler, Button, InputGroupAddon, SectionWrapper, InputText],
  templateUrl: './financial.html',
  styleUrl: './financial.css',
})
export class Financial extends BaseComponent {
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

  log(...data: any) {
    console.log(data);
  }
  first = 0;
  rows = 10;
  onPageChange(event: any) {}
}
