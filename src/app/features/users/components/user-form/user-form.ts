import { Component } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-user-form',
  imports: [InputErrorMessageHandler, Button, InputText, Textarea, Select],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm {}
