import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { RouterLink, RouterLinkActive, RouterLinkWithHref, RouterOutlet } from '@angular/router';
import { Button, ButtonDirective } from 'primeng/button';
import { CarouselModule, Carousel } from 'primeng/carousel';
import { Textarea } from 'primeng/textarea';

enum DocFormSections {
  opening = 1,
  closing = 2,
  deficitReduction = 3,
}

@Component({
  selector: 'app-daily-journal',
  imports: [
    SectionWrapper,
    InputErrorMessageHandler,
    InputGroupAddon,
    ReactiveFormsModule,
    InputText,
    RouterLink,
    RouterLinkActive,
    RouterLinkWithHref,
    Button,
    Carousel,
    Textarea,
    RouterOutlet,
    ButtonDirective
],
  templateUrl: './daily-journal.html',
  styleUrl: './daily-journal.css',
})
export class DailyJournal extends BaseComponent {
  DocFormSections = DocFormSections;
  initialSearchFormValue = {
    text: this.fb.control<string>('', [Validators.required]),
    categoryId: this.fb.control<number>(0, [Validators.required]),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  periodOptions = [
    { label: 'اليوم', value: 1 },
    { label: 'الاسبوع', value: 2 },
    { label: 'الشهر', value: 3 },
    { label: 'السنة', value: 4 },
  ];

  onSubmit() {}

  first = 0;
  rows = 10;
  onPageChange(event: any) {}

  sectionIds: DocFormSections[] = [DocFormSections.opening, DocFormSections.closing, DocFormSections.deficitReduction];
  responsiveOptions = [
    {
      breakpoint: '1400px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '1199px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1,
    },
    {
      breakpoint: '575px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
