import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-deliveries-nav',
  imports: [RouterLink, RouterLinkActive,TranslatePipe],
  templateUrl: './deliveries-nav.html',
  styleUrl: './deliveries-nav.css',
})
export class DeliveriesNav {

}
