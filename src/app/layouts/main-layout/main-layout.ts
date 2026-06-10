import { Component, signal } from '@angular/core';
import { Sidebar } from "../../shared/components/sidebar/sidebar";
import { Header } from "../../shared/components/header/header";
import { RouterOutlet } from "@angular/router";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [Sidebar, Header, RouterOutlet,NgClass],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
})
export class MainLayout {
  protected readonly title = signal('spider2026');

  
  showSidebar = true;

  ShowAndHideSidebar(e:any){
    // console.log(e)
    this.showSidebar = !this.showSidebar;
    console.log(this.showSidebar);
  }
}
