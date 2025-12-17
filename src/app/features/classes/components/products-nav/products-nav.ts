import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-products-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './products-nav.html',
  styleUrl: './products-nav.css',
})
export class ProductsNav {

}
