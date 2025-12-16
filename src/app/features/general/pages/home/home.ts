import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from "@/directives/img-fallback";
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-home',
  imports: [Menu, ButtonModule, Dialog, InputTextModule, AvatarModule, ImgFallback,DrawerModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  isMenuVisible: boolean = false;


  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
}
