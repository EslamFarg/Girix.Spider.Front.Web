import { Component } from '@angular/core';
import { Header } from "@/components/header/header";
import { RouterOutlet } from '@angular/router';
import { Footer } from "@/components/footer/footer";
import { Sidebar } from "@/components/sidebar/sidebar";

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
constructor () {
  console.log('MainLayout');
}
}
