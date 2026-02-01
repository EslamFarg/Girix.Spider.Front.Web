import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { GroupForm } from '../../components/group-form/group-form';
import { MealForm } from '../../components/meal-form/meal-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-edit-meal',
  imports: [SectionWrapper, Button, GroupForm, MealForm],
  templateUrl: './edit-meal.html',
  styleUrl: './edit-meal.css',
})
export class EditMeal extends BaseComponent {}
