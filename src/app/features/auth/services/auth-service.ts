import { Role } from '@/core';
import { ApiUrlOverrideService } from '@/core/services/api-url-override-service';
import BaseService from '@/core/services/BaseService';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface ILoginDto {
  emailOrPhone: string;
  password: string;
}

export interface IUserDetails {
   userId: string
  fullName: string
  email: string
  phoneNumber: any
  token: string
  cashierCollectionAccountId: number
  cashierCollectionAccountName: string
  custodyAccountId: number
  custodyAccountName: string
  cashPaymentAccountId: number
  cashPaymentAccountName: string
  bankPaymentAccountId: number
  bankPaymentAccountName: string
  groups: {
    id: number
    name: string
  }[]
  setting: {
    name: string
    phoneNumber: string
  }
}

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  userDetails = signal<IUserDetails | null>(this.get('userDetails'));
  isAuthenticated = computed(() => this.userDetails() !== null);
  apiUrlOverrideService = inject(ApiUrlOverrideService);
  override apiRoute = 'Auth';
  integrationApi = 'https://majedsoftcompany-001-site17.stempurl.com';
  roles = computed(() => this.userDetails()?.groups.map((g) => g.id) ?? []);
  isWaiter = computed(() => this.roles().includes(Role.Waiter));

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
          cashierCollectionAccountId: 1,
          cashierCollectionAccountName: 'Cashier Collection Account',
          custodyAccountId: 2,
          custodyAccountName: 'Custody Account',
          cashPaymentAccountId: 3,
          cashPaymentAccountName: 'Cash Payment Account',
          bankPaymentAccountId: 4,
          bankPaymentAccountName: 'Bank Payment Account',
        });
        observer.complete();
      });
    } else {
      loginResultObs = this.http.post<IUserDetails>(`${this.apiUrl}/login`, dto, {
        headers: {
          passJwt: 'true',
        },
      });
    }

    return loginResultObs;
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

    return this.http.post<boolean>(
      `${this.apiUrl}/forgetPassword`,
      { email },
      {
        headers: {
          passJwt: 'true',
        },
      },
    );
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
      }>(
        `${this.apiUrl}/validOtp`,
        {
          email: this.forgotPasswordEmail,
          otp,
        },
        {
          headers: {
            passJwt: 'true',
          },
        },
      )
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

  //
  //
  //
  //
  //
  //
  //crm
  //

  currentCrmEmail='';

  sendCrmOtpToEmail(currentCrmEmail: string) {
    this.currentCrmEmail = currentCrmEmail;
    return this.http.get<boolean>(`${this.integrationApi}/AuthUsers/GetAllYourActivations?email=${currentCrmEmail}`);

    //then redirect to crm otp validation on success
  }

  resendCrmOtpToEmail() {
    return this.sendCrmOtpToEmail(this.currentCrmEmail);
  }

  validateCrmOtp(otp: string) {
    return this.http
      .get<{
        expireDate: string;
        link: string;
      }>(`${this.integrationApi}/ProgramActivation/MobileProductActiveForClient?cloudIdActivation=${otp}`)
      .pipe(
        tap({
          next: (result) => {
            let link = result.link;
            if (link[link.length - 1] !== '/') {
              link += '/';
            }
            link += 'v1';
            this.apiUrlOverrideService.applyApiUrl(link);
            this.save('activationToken', otp);
            this.save('crmEmail', this.currentCrmEmail);
          },
        }),
      );
  }
}
