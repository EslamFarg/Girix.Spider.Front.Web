import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputTextModule } from 'primeng/inputtext';
import { Replacements, SpacesEnum } from '../../services/replacements';
import { Paginator } from "primeng/paginator";

@Component({
  selector: 'app-tables',
  imports: [InputTextModule, SectionWrapper, InputErrorMessageHandler, InputGroupAddon, ReactiveFormsModule, Paginator],
  templateUrl: './tables.html',
  styleUrl: './tables.css',
})
export class Tables  extends BaseComponent {
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);
  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}



  replacementsService=inject(Replacements)
  openDialog() {
    this.replacementsService.openDialog(SpacesEnum.Tables);
  }
}
