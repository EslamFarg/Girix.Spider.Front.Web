import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { MealForm } from '../../components/meal-form/meal-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-add-meal',
  imports: [SectionWrapper, Button, MealForm],
  templateUrl: './add-meal.html',
  styleUrl: './add-meal.css',
})
export class AddMeal extends BaseComponent {}
