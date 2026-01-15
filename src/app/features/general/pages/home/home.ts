import { Component, inject, signal } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from '@/directives/img-fallback';
import { DrawerModule } from 'primeng/drawer';
import { GeneralService, ProductAndMealsSearchEnum } from '../../services/general-service';
import { BaseComponent } from '@/components/base-component/base-component';
import { Validators } from '@angular/forms';
import { IProductRowResponse } from '@/features/classes/services/product-service';
import { IMealRowResponse } from '@/features/classes/services/meal-service';
import { GroupService, IGroupRowResponse, IGroupSearchResponseValue } from '@/features/classes/services/group-service';

@Component({
  selector: 'app-home',
  imports: [Menu, ButtonModule, Dialog, InputTextModule, AvatarModule, ImgFallback, DrawerModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home extends BaseComponent {
  isMenuVisible: boolean = false;
  
  visible: boolean = false;
  groupsService=inject(GroupService);
  groups=signal<IGroupRowResponse[]>([]);

  showDialog() {
    this.visible = true;
  }

  /**
   *
   */
  constructor() {
    super();
    this.groupsService.getList(false,{pageIndex:0,pageSize:0}).subscribe({
      next:(res)=>{
        this.groups.set(res.rows);
      }
    })
  }
}
