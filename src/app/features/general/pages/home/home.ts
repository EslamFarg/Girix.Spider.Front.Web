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

@Component({
  selector: 'app-home',
  imports: [Menu, ButtonModule, Dialog, InputTextModule, AvatarModule, ImgFallback, DrawerModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home extends BaseComponent {
  isMenuVisible: boolean = false;
  
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  
}
