import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: 'app-users-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './users-nav.html',
  styleUrl: './users-nav.css',
})
export class UsersNav {

}
