import { SectionNav, SectionWrapper, ISectionLink } from '@/components';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-journals-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './journals-layout.html',
  styleUrl: './journals-layout.css',
})
export class JournalsLayout {
links: ISectionLink[] = [
    {
      labelKey: 'journals.explorer',
      url: '/accounts/journals',
    },
    {
      labelKey: 'journals.add',
      url: '/accounts/journals/add',
    },
  ];
}
