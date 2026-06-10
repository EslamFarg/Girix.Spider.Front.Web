import { Component, effect, input } from '@angular/core';
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-tree-permissions',
  imports: [NgClass],
  templateUrl: './tree-permissions.html',
  styleUrl: './tree-permissions.scss',
})
export class TreePermissions {

  tree=input<any>()
  level=input<any>(0)


  constructor(){
    effect(()=>{
      console.log(this.level());
    })
  }
}
