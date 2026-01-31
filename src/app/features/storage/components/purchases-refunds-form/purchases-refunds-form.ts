import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { DatePicker } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
@Component({
  selector: 'app-purchases-refunds-form',
  imports: [Button, InputErrorMessageHandler, InputGroupAddon, DatePicker, InputTextModule, Select, TextareaModule],
  templateUrl: './purchases-refunds-form.html',
  styleUrl: './purchases-refunds-form.css',
})
export class PurchasesRefundsForm {}
