import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LayoutService } from '../services/layout-service';
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet,ProgressSpinnerModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {
  layoutService=inject(LayoutService);
  isLoading=this.layoutService.isLoading;
}
