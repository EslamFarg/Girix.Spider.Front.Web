import { Component } from '@angular/core';
import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { RouterOutlet } from '@angular/router';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-suppliers-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './suppliers-layout.html',
  styleUrl: './suppliers-layout.css',
})
export class SuppliersLayout {
  links: ISectionLink[] = [
    {
      labelKey: 'SUPPLIERS.EXPLORER',
      url: '/accounts/suppliers',
    },
    {
      labelKey: 'SUPPLIERS.ADD',
      url: '/accounts/suppliers/add',
    },
  ];
}
