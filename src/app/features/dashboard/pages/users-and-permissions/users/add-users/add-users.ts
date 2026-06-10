import { Component } from '@angular/core';
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-add-users',
  imports: [DatePicker, NgSelectComponent,RouterLink],
  templateUrl: './add-users.html',
  styleUrl: './add-users.scss',
})
export class AddUsers {}
