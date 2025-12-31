import BaseService from '@/core/services/BaseService';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface ILoginDto {
  emailOrPhone: string;
  password: string;
}

export interface IUserDetails {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  token: string;
  groups: [
    {
      id: number;
      name: string;
    }
  ];
  setting: {
    name: string;
    phoneNumber: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  userDetails = signal<IUserDetails | null>(this.get('userDetails'));
  isAuthenticated = computed(() => this.userDetails() !== null);
  login(dto: ILoginDto) {
    let loginResultObs: Observable<IUserDetails>;

    if (this.isMock) {
      loginResultObs = new Observable<IUserDetails>((observer) => {
        observer.next({
          userId: '1',
          fullName: 'John Doe',
          email: '0Eg0w@example.com',
          phoneNumber: '1234567890',
          token: 'token',
          groups: [
            {
              id: 1,
              name: 'Admin',
            },
          ],
          setting: {
            name: 'John Doe',
            phoneNumber: '1234567890',
          },
        });
        observer.complete();
      });
    } else {
      loginResultObs = this.http.post<IUserDetails>(`${this.apiUrl}/auth/login`, dto);
    }

    return loginResultObs.pipe(
      tap({
        next: (userDetails) => {
          this.userDetails.set(userDetails);
          this.router.navigate(['/']);
        },
      })
    );
  }

  forgotPassword(email: string) {
    return this.http.post<boolean>(`${this.apiUrl}/auth/forgetPassword`, { email });
  }

  validateOtp(dto: { email: string; otp: string }) {
    return this.http.post<boolean>(`${this.apiUrl}/auth/validOtp`, dto);
  }

  logout() {
    this.remove('userDetails');
    this.userDetails.set(null);
    this.router.navigate(['/auth/login']);
  }
}
