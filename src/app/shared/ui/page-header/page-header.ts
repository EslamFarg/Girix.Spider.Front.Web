import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-page-header',
  imports: [NgClass,RouterLink],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
})
export class PageHeader {

  
  titleHeader=input<string>();
  actions=input<{label:string,type?:string,action:string}[]>();
  explorerBtn=input<{label:string,link:string}>();
  actionClicked=output<string>();

  onActionClicked(action:string){
    this.actionClicked.emit(action);
  }

}
