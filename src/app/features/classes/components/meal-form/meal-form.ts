import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { InputText } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-meal-form',
  imports: [Button, InputErrorMessageHandler, InputText, SelectModule, CarouselModule, TextareaModule],
  templateUrl: './meal-form.html',
  styleUrl: './meal-form.css',
})
export class MealForm {}
