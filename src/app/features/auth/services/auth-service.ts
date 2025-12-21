import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = signal(false);
  router=inject(Router);


  login() {
    this.isAuthenticated.set(true);
  }

  logout() {
    // this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
