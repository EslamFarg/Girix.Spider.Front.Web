import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { MealsNav } from "../../components/meals-nav/meals-nav";
import { Button } from "primeng/button";

@Component({
  selector: 'app-view-meal',
  imports: [GroupsNav, SectionWrapper, MealsNav, Button],
  templateUrl: './view-meal.html',
  styleUrl: './view-meal.css',
})
export class ViewMeal {

}
