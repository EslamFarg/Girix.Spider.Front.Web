import { Component } from '@angular/core';
import { RouterLinkActive, RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-app-info-nav',
  imports: [RouterLinkActive, RouterLinkWithHref],
  templateUrl: './app-info-nav.html',
  styleUrl: './app-info-nav.css',
})
export class AppInfoNav {}
