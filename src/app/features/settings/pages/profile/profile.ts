import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-profile',
  imports: [Button, InputErrorMessageHandler, Select, InputText, Textarea, SectionWrapper],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {}
