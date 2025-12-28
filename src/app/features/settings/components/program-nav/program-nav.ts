import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { RouterLinkActive, RouterLinkWithHref } from "@angular/router";

@Component({
  selector: 'app-program-nav',
  imports: [Button, RouterLinkActive, RouterLinkWithHref],
  templateUrl: './program-nav.html',
  styleUrl: './program-nav.css',
})
export class ProgramNav {

}
