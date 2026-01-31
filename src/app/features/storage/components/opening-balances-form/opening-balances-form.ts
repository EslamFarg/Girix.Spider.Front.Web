import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Textarea } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-opening-balances-form',
  imports: [Button, InputErrorMessageHandler, Textarea, InputTextModule, DatePickerModule, InputGroupAddon],
  templateUrl: './opening-balances-form.html',
  styleUrl: './opening-balances-form.css',
})
export class OpeningBalancesForm {}
