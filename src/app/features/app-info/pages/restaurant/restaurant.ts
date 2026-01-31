import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-restaurant',
  imports: [InputErrorMessageHandler, Select, Button, Textarea, InputText, SectionWrapper],
  templateUrl: './restaurant.html',
  styleUrl: './restaurant.css',
})
export class Restaurant {}
