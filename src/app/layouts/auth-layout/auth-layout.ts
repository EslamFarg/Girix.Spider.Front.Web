import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LayoutService } from '../services/layout-service';
import { BaseComponent } from '@/components/base-component/base-component';
@Component({
  selector: 'app-auth-layout',
  imports: [RouterOutlet, ProgressSpinnerModule],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout extends BaseComponent {
 }
