import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-groups-layout',
  imports: [SectionNav, RouterOutlet],
  templateUrl: './groups-layout.html',
  styleUrl: './groups-layout.css',
})
export class GroupsLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'groups.explorer',
      url: '/classes/groups',
    },
    {
      labelKey: 'groups.add',
      url: '/classes/groups/add',
    },
  ];
}
