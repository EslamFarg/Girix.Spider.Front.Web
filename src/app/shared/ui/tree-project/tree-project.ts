import { Component, input, Input } from '@angular/core';

@Component({
  selector: 'app-tree-project',
  imports: [],
  templateUrl: './tree-project.html',
  styleUrl: './tree-project.scss',
})
export class TreeProject {
 tree: any=input<any>();
level=input<any>(0) ;
}
