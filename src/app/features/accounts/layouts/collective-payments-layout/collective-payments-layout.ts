import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';

@Component({
  selector: 'app-collective-payments-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './collective-payments-layout.html',
  styleUrl: './collective-payments-layout.css',
})
export class CollectivePaymentsLayout {
  /**
   * مستكشف السندات
   * إضافه سند صرف جديد
   */
  links: ISectionLink[] = [
    {
      labelKey: 'COLLECTIVE_PAYMENTS.EXPLORER',
      url: '/accounts/collective-payments',
    },
    {
      labelKey: 'COLLECTIVE_PAYMENTS.ADD',
      url: '/accounts/collective-payments/add',
    },
  ];
}
