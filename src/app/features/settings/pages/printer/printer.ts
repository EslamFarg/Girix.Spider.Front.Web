import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Select } from "primeng/select";
import { Button } from "primeng/button";

@Component({
  selector: 'app-printer',
  imports: [SectionWrapper, InputErrorMessageHandler, Select, Button],
  templateUrl: './printer.html',
  styleUrl: './printer.css',
})
export class Printer {

}

 