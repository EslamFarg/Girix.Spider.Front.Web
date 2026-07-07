import { Injectable, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SharedStateServices {

    private selectedId=signal<number | null>(null);
    private isEditMode=signal<boolean>(false);

    readonly selectedId$=this.selectedId.asReadonly();
    readonly isEditMode$=this.isEditMode.asReadonly();

     constructor(router: Router) {
    router.events
      .pipe(filter(event => event instanceof NavigationStart))
      .subscribe(() => {
        this.clearSelectedId();
      });
  }

    setSelectedId(id:number){
      this.selectedId.set(id);
      this.isEditMode.set(true);
    }

    setEditMode(isEditMode:boolean){
      this.isEditMode.set(isEditMode);
    }

    clearSelectedId(){
      this.selectedId.set(null);
      this.isEditMode.set(false);
    }



}
