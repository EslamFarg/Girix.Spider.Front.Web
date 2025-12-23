import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Textarea } from "primeng/textarea";
 import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputTextModule } from 'primeng/inputtext';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-journals',
  imports: [Button, InputErrorMessageHandler, Textarea, InputTextModule, DatePickerModule, InputGroupAddon, SectionWrapper],
  templateUrl: './journals.html',
  styleUrl: './journals.css',
})
export class Journals {

}
