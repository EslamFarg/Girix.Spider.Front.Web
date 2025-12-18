import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { MealsNav } from "../../components/meals-nav/meals-nav";
import { Button } from "primeng/button";
import { MealForm } from "../../components/meal-form/meal-form";

@Component({
  selector: 'app-add-meal',
  imports: [GroupsNav, SectionWrapper, MealsNav, Button, MealForm],
  templateUrl: './add-meal.html',
  styleUrl: './add-meal.css',
})
export class AddMeal {

}
