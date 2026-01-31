import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-default-accounts',
  imports: [SectionWrapper, InputErrorMessageHandler, Select, Button],
  templateUrl: './default-accounts.html',
  styleUrl: './default-accounts.css',
})
export class DefaultAccounts {}
