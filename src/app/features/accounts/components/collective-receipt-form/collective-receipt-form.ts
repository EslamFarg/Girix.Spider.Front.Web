import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-collective-receipt-form',
  imports: [Button, InputErrorMessageHandler, InputGroupAddon, DatePicker, InputText, Textarea, Select],
  templateUrl: './collective-receipt-form.html',
  styleUrl: './collective-receipt-form.css',
})
export class CollectiveReceiptForm {}
