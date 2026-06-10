import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-add-users-and-permissions',
  imports: [NgSelectComponent,RouterLink],
  templateUrl: './add-users-and-permissions.html',
  styleUrl: './add-users-and-permissions.scss',
})
export class AddUsersAndPermissions {}
