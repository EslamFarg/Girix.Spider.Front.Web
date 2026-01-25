import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-meals-layout',
  imports: [SectionNav, RouterOutlet],
  templateUrl: './meals-layout.html',
  styleUrl: './meals-layout.css',
})
export class MealsLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'meals.explorer',
      url: '/classes/meals',
     },
    {
      labelKey: 'meals.add',
      url: '/classes/meals/add',
     },
  ];
}
