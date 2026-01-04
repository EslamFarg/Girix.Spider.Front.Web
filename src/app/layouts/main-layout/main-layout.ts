import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { Header } from '@/components/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from '@/components/footer/footer';
import { Sidebar } from '@/components/sidebar/sidebar';
import { BaseComponent } from '@/components/base-component/base-component';
import { LayoutService } from '../services/layout-service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout extends BaseComponent {
  constructor() {
    super();
    console.log('MainLayout');
  }
  isLoading = this.layoutService.isLoading;
  header = viewChild<Header>('header');
  mainEl = viewChild<ElementRef<HTMLElement>>('main');

  // ngAfterViewInit() {
  //   const el = this.mainEl()?.nativeElement;
  //   if(el){
  //     console.log('this.header()!.height', this.header()!.height);
  //     el.style.height = `calc(100vh - ${this.header()!.height??0}px)`
  //   }
  // }
}
