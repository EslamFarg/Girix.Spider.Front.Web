import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectComponent } from "@ng-select/ng-select";
import { RouterLink } from "@angular/router";
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DatePicker } from "primeng/datepicker";

@Component({
  selector: 'app-page-header-search',
  imports: [NgSelectComponent, FormsModule, RouterLink, ButtonModule, DialogModule, InputTextModule, DatePicker],
  templateUrl: './page-header-search.html',
  styleUrl: './page-header-search.scss',
})
export class PageHeaderSearch {

  // !!!!!!!!!!!!!! Services
  titleHeading=input<string>()
  addButton=input<{label:string,type?:string,action:string}>();
  filteringData=input<{label:string,key?:string,type?:string,value:string,class:string,placeholder:string}[]>();




  // !!!!!!!!!!!! Properties
  sizePagination=[
    {name:'25',id:1},
    {name:'50',id:2},
    {name:'100',id:3},
    {name:'200',id:4},
    {name:'250',id:5},
  ]
  selectedSize='25'
  visible: boolean = false;

  // !!!!!!!!!!!!!!!!!!! Methods
    showDialog() {
        this.visible = true;
    }

  



}
