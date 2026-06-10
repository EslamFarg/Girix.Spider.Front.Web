import { NgClass } from '@angular/common';
import { Component, Input, input, output } from '@angular/core';

@Component({
  selector: 'app-tree-node',
  imports: [NgClass],
  templateUrl: './tree-node.html',
  styleUrl: './tree-node.scss',
})
export class TreeNode {

  @Input() node: any;
  @Input() level: number = 0;
  eventClicked = output<any>()



  callApi(node:any){
    node.expanded = !node.expanded

    if(this.level > 0){
      this.eventClicked.emit(node.id);
    }
  }
}
