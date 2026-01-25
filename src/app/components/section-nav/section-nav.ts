import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonDirective } from "primeng/button";

export interface ISectionLink {
  labelKey: string;
  url: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-section-nav',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, ButtonDirective],
  templateUrl: './section-nav.html',
  styleUrl: './section-nav.css',
})
export class SectionNav {
  links = input.required<ISectionLink[]>();
}
