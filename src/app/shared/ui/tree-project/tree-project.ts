import { Component, input, Input, output } from '@angular/core';

@Component({
  selector: 'app-tree-project',
  imports: [],
  templateUrl: './tree-project.html',
  styleUrl: './tree-project.scss',
})
export class TreeProject {
 tree: any=input<any>();
level=input<any>(0) ;
isDeleteOrUpdate=output<any>();



sendEventDelete(event: any,parent: any) {
  this.isDeleteOrUpdate.emit({event,parent});
}
sendEventEdit(event: any,parent: any) {
  this.isDeleteOrUpdate.emit({event,parent});  
}
}
