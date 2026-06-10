import { Component, ViewChild } from '@angular/core';
import { NgClass, NgTemplateOutlet } from "@angular/common";
import { NgSelectComponent } from "@ng-select/ng-select";
import { DatePicker } from "primeng/datepicker";

@Component({
  selector: 'app-branch-settings',
  imports: [NgTemplateOutlet, NgClass, NgSelectComponent, DatePicker],
  templateUrl: './branch-settings.html',
  styleUrl: './branch-settings.scss',
})
export class BranchSettings {

  currentTemplate: any='main';


  showCustomersData=[
    {
      id:1,
      name:'أظهار العملاء',
    },
    {
      id:2,
      name:'الموردين',
    },
    {
      id:3,
      name:' العملاء والموردين',
    },
    {
      id:4,
      name:' إخفاء العملاء والموردين للفروع',
    },
  ]




}
