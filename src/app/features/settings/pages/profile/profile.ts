import { Component, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { emailValidator, InputErrorMessageHandler, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SectionWrapper } from '@/components';
import { BaseComponent } from '@/components';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserReadResponse, UserService, IUserFgControls, UserType } from '@/features/users';
import { FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-profile',
  imports: [Button, InputErrorMessageHandler, Select, InputText, Textarea, SectionWrapper, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile extends BaseComponent {
  initialusersFgValue: IUserFgControls = {
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),

    nameEn: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),

    phoneNumber: this.fb.control(null, [
      Validators.required,
      Validators.minLength(8),
      onlyNumbersAllowed,
      Validators.maxLength(13),
    ]),
    isActive: this.fb.control(true, [Validators.required]),
    email: this.fb.control(null, [Validators.required, emailValidator]),
    //ids
    groupId: this.fb.control(null, []),
    cashierCollectionAccountId: this.fb.control(null, []),
    custodyAccountId: this.fb.control(null, []),
    cashPaymentAccountId: this.fb.control(null, []),
    bankPaymentAccountId: this.fb.control(null, []),
    //update only
    userId: this.fb.control(null, []),
  };

  userFg = this.fb.group(this.initialusersFgValue);

  //services
  usersService = inject(UserService);

  userTypes = signal([
    { id: UserType.Admin, name: 'Admin' },
    { id: UserType.Cashier, name: 'Cashier' },
    { id: UserType.Waiter, name: 'Waiter' },
  ]);

  /**
   *
   */
  constructor() {
    super();
    this.usersService.getById(+this.authService.userDetails()!.userId).subscribe((users: IUserReadResponse | any) => {
      this.userFg.patchValue({ ...users, nameAr: users.name, nameEn: users.name });
    });
  }

  onSubmitForm() {
    this.userFg.patchValue({
      nameEn: this.userFg.value.nameAr?.trim(),
    });

    // debugger;
    if (this.userFg.invalid) {
      this.userFg.markAllAsTouched();
      return;
    }

    // let dto:{[key:string] : string | number}={};

    // Object.entries(this.userFg.value).forEach(([key, value]:[string,any]) => {
    //   if (Array.isArray(value)) {
    //     value.forEach((val) => {
    //       dto[key]=val
    //     });
    //   }else{
    //     dto[key]=value
    //   }
    // })

    // console.log(dto);

    this.usersService.put(this.userFg.value).subscribe();
  }
}
