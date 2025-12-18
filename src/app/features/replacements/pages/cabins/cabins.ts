import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-cabins',
  imports: [InputTextModule, SectionWrapper, InputErrorMessageHandler, InputGroupAddon,ReactiveFormsModule],
  templateUrl: './cabins.html',
  styleUrl: './cabins.css',
})
export class Cabins extends BaseComponent {
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
