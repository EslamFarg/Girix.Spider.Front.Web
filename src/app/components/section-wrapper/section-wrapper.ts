import { Component, input } from '@angular/core';

@Component({
  selector: 'app-section-wrapper',
  imports: [],
  templateUrl: './section-wrapper.html',
  styleUrl: './section-wrapper.css',
})
export class SectionWrapper {
  styleClass = input<string>();
}
