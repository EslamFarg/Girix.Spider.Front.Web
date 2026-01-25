import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { MealForm } from '../../components/meal-form/meal-form';
import { GroupForm } from '../../components/group-form/group-form';

@Component({
  selector: 'app-add-group',
  imports: [SectionWrapper, Button, MealForm, GroupForm],
  templateUrl: './add-group.html',
  styleUrl: './add-group.css',
})
export class AddGroup {}
