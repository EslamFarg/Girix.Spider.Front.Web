import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from "@/components/section-nav/section-nav";
import { RouterOutlet } from '@angular/router';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-users-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './users-layout.html',
  styleUrl: './users-layout.css',
})
export class UsersLayout {
  links:ISectionLink[] = [
    {
      labelKey: 'Users.explorer',
      url: '/users'
    },
    {
      labelKey: 'Users.add',
      url: '/users/add'
    }
  ]
}
