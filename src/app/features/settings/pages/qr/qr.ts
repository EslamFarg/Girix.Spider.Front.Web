import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputGroupAddon } from "primeng/inputgroupaddon";
import { InputText } from "primeng/inputtext";
import { Button } from "primeng/button";

@Component({
  selector: 'app-qr',
  imports: [SectionWrapper, InputErrorMessageHandler, InputGroupAddon, InputText, Button],
  templateUrl: './qr.html',
  styleUrl: './qr.css',
})
export class Qr {

}
