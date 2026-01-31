import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

@Component({
  selector: 'app-customers-form',
  imports: [Button, Carousel, InputErrorMessageHandler, Select, InputText, Textarea],
  templateUrl: './customers-form.html',
  styleUrl: './customers-form.css',
})
export class CustomersForm {}
