import { Component } from '@angular/core';
import { Dialog, DialogStyle } from 'primeng/dialog';
import { InputErrorMessageHandler } from "@/yn-ng";
import { Select } from "primeng/select";
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-order-transference-dialog',
  imports: [InputErrorMessageHandler, Select, InputText, Dialog],
  templateUrl: './order-transference-dialog.html',
  styleUrl: './order-transference-dialog.css',
  providers: [DialogStyle],
})
export class OrderTransferenceDialog extends Dialog {
  thisDialog = this
}
