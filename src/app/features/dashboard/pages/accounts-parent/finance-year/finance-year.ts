import { Component } from '@angular/core';
import { DatePicker } from "primeng/datepicker";
import { NgSelectComponent } from "@ng-select/ng-select";

@Component({
  selector: 'app-finance-year',
  imports: [DatePicker, NgSelectComponent],
  templateUrl: './finance-year.html',
  styleUrl: './finance-year.scss',
})
export class FinanceYear {}
