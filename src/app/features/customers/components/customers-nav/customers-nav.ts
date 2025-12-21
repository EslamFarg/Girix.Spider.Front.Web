import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-customers-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './customers-nav.html',
  styleUrl: './customers-nav.css',
})
export class CustomersNav {

}
