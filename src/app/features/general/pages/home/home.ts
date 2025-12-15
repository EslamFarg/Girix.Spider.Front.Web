import { Component } from '@angular/core';
import { Menu } from '../../components/menu/menu';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { ImgFallback } from "@/directives/img-fallback";
@Component({
  selector: 'app-home',
  imports: [Menu, ButtonModule, Dialog, InputTextModule, AvatarModule, ImgFallback],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }
}
