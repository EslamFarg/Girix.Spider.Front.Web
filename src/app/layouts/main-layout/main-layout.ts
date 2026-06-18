import { Component, ElementRef, inject, viewChild } from '@angular/core';
import { Header } from '@/components/header/header';
import { RouterOutlet } from '@angular/router';
import { Footer } from '@/components/footer/footer';
import { Sidebar } from '@/components/sidebar/sidebar';
import { BaseComponent } from '@/components/base-component/base-component';
import { LayoutService } from '../services/layout-service';
import { Dialog } from "primeng/dialog";
import { FullKeyboard } from "@/features/keyboard/components/full-keyboard/full-keyboard";
import { NumbersKeyboardDialog } from "@/features/keyboard/components/numbers-keyboard-dialog/numbers-keyboard-dialog";
import { PrinterSettingsService } from '@/features/printers/services/printer-settings-service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header, Dialog, FullKeyboard, NumbersKeyboardDialog],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout extends BaseComponent {
  constructor(printerSettingsService: PrinterSettingsService) {
    super();
    printerSettingsService.getSettings().subscribe();

   }
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
