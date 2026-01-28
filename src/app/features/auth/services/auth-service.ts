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
    },
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
  // userDetails = signal<IUserDetails | null>(this.get('userDetails'));
  userDetails = signal<IUserDetails | null>({
    email: '',
    fullName: '',
    phoneNumber: '',
    token: '',
    userId: '123',
    groups: [{ id: 0, name: '' }],
    setting: { name: '', phoneNumber: '' },
  });
  isAuthenticated = computed(() => this.userDetails() !== null);
  override apiRoute = 'Auth';

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
      loginResultObs = this.http.post<IUserDetails>(`${this.apiUrl}/login`, dto);
    }

    return loginResultObs.pipe(
      tap({
        next: (userDetails) => {
          this.userDetails.set(userDetails);
          this.router.navigate(['/']);
        },
      }),
    );
  }

  get forgotPasswordEmail() {
    return this.get('forgotPasswordEmail');
  }
  get forgotPasswordToken() {
    return this.get('forgotPasswordToken');
  }

  forgotPassword(email: string) {
    this.save('forgotPasswordEmail', email);

    if (this.isMock) {
      return new Observable<boolean>((observer) => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.http.post<boolean>(`${this.apiUrl}/forgetPassword`, { email });
  }

  validateOtp(otp: string) {
    if (this.isMock) {
      return new Observable<{
        token: string;
        userId: string;
      }>((observer) => {
        observer.next({
          token: 'token',
          userId: '1234567890123456789012345678901234567890',
        });
        observer.complete();
      }).pipe(
        tap({
          next: (result) => {
            this.save('forgotPasswordToken', result.token);
          },
        }),
      );
    }

    return this.http
      .post<{
        token: string;
        userId: string;
      }>(`${this.apiUrl}/validOtp`, {
        email: this.forgotPasswordEmail,
        otp,
      })
      .pipe(
        tap({
          next: (result) => {
            this.save('forgotPasswordToken', result.token);
          },
        }),
      );
  }

  logout() {
    this.remove('userDetails');
    this.userDetails.set(null);
    this.router.navigate(['/auth/login']);
  }

  changePassword(dto: { newPassword: string; confirmPassword: string }) {
    if (this.isMock) {
      return new Observable<boolean>((observer) => {
        observer.next(true);
        observer.complete();
      });
    }

    return this.http.post<boolean>(`${this.apiUrl}/changePassword`, dto);
  }
}
