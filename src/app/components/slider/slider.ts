import { Component, ElementRef, input, TemplateRef, viewChild } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { NgTemplateOutlet } from '@angular/common';
 @Component({
  selector: 'app-slider',
  imports: [ButtonDirective, NgTemplateOutlet],
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class Slider {
  items = input<any[]>();
  valueVar=0;
  config = input<{
    itemWidth: number;
  }>({
    itemWidth: 100,
  });

  itemsContainer = viewChild<ElementRef<HTMLElement>>('itemsContainer');
  template = input.required<TemplateRef<any>>();
  scrollLeft() {
    const slider = this.itemsContainer()?.nativeElement;

    if (slider) {
      console.log('slider scroll by -100');
      slider.scrollBy({
        left: -100,
        behavior: 'smooth',
      });
    }
  }

  scrollRight() {
    const slider = this.itemsContainer()?.nativeElement;

    if (slider) {
      slider.scrollBy({
        left: 100,
        behavior: 'smooth',
      });
    }
  }
}
