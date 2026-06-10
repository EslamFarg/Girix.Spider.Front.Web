import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-users',
  imports: [RouterLink, DatePicker, NgSelectComponent, Dialog, RouterOutlet],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {}
