import { ISectionLink, SectionNav } from '@/components/section-nav/section-nav';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-collective-receipts-layout',
  imports: [SectionNav, RouterOutlet, SectionWrapper],
  templateUrl: './collective-receipts-layout.html',
  styleUrl: './collective-receipts-layout.css',
})
export class CollectiveReceiptsLayout {
  /**
   * مستكشف السندات
   * إضافه سند قبض جديد
   */
  links: ISectionLink[] = [
    {
      labelKey: 'collectiveReceipts.explorer',
      url: '/accounts/collective-receipts',
    },
    {
      labelKey: 'collectiveReceipts.add',
      url: '/accounts/collective-receipts/add',
    },
  ];
}
