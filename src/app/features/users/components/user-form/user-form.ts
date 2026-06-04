import { Component, computed, inject, input, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { IUserFgControls } from '../../types/users/form';
import { UserService } from '../../services/user-service';
import { FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import {
  IBankFinancialAccount,
  ICashFinancialAccount,
  ICustodyFinancialAccount,
} from '@/features/accounts/types';
import { IUserReadResponse } from '../../types/users/api';
import { UserType } from '../../types';
import { RouterLink } from "@angular/router";
import { LoadingDisabledDirective } from "@/directives/loading-disabled";
// import { IusersFgControls } from '@/features/deliveries/components/users-man-form/types';
// import { usersService } from '@/features/deliveries/services/users-service';

@Component({
  selector: 'app-user-form',
  imports: [
    InputErrorMessageHandler,
    Button,
    InputText,
    Textarea,
    ButtonDirective,
    Select,
    TranslatePipe,
    ReactiveFormsModule,
    RouterLink,
    LoadingDisabledDirective
],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm extends BaseComponent {
  formMode = computed(() => {
    if (this.currentUser()) return FormMode.Update;
    return this.initialFormMode();
  });
  id = input.required<number | null>();

  initialusersFgValue: IUserFgControls = {
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),

    nameEn: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),

    phoneNumber: this.fb.control(null, [
      Validators.required,
      Validators.minLength(8),
      onlyNumbersAllowed,
      Validators.maxLength(14),
    ]),
    isActive: this.fb.control(true, [Validators.required]),
    email: this.fb.control(null, [Validators.required, emailValidator]),
    //ids
    groupId: this.fb.control(null, [Validators.required]),
    cashierCollectionAccountId: this.fb.control(null, [Validators.required]),
    custodyAccountId: this.fb.control(null, [Validators.required]),
    cashPaymentAccountId: this.fb.control(null, [Validators.required]),
    bankPaymentAccountId: this.fb.control(null, [Validators.required]),
    image: this.fb.control(null, []),
    //update only
    userId: this.fb.control(null, []),
  };

  userFg = this.fb.group(this.initialusersFgValue);

  //services
  usersService = inject(UserService);
  financialAccountsService = inject(FinancialAccountService);
  currentUser = signal<IUserReadResponse | null>(null);

  //
  cashFinancialAccounts = signal<ICashFinancialAccount[]>([]);
  cashierFinancialAccounts = this.cashFinancialAccounts.asReadonly();
  bankFinancialAccounts = signal<IBankFinancialAccount[]>([]);
  custodyAccounts = signal<ICustodyFinancialAccount[]>([]);

  userTypes = signal([
    { id: UserType.Admin, nameAr: 'Admin', nameEn: 'Admin' },
    { id: UserType.Cashier, nameAr: 'Cashier', nameEn: 'Cashier' },
    { id: UserType.Waiter, nameAr: 'Waiter', nameEn: 'Waiter' },
  ]);
  /**
   *
   */
  constructor() {
    super();
    this.financialAccountsService.getCashAndBankAccountsAndCustodyAccounts().subscribe((cashBankCustodyAccounts) => {
      this.cashFinancialAccounts.set(cashBankCustodyAccounts.cash);
      this.bankFinancialAccounts.set(cashBankCustodyAccounts.bank);
      this.custodyAccounts.set(cashBankCustodyAccounts.custody);
    });
  }

  //
  //
  //
  //
  ngOnInit(): void {
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        //fetch
        this.usersService.getById(this.id()!).subscribe((users: IUserReadResponse | any) => {
          this.currentUser.set(users);
          this.userFg.patchValue({ ...users, nameAr: users.name, nameEn: users.name });
        });
        break;
    }
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

    const formData = new FormData();

    Array.from(Object.entries(this.userFg.value)).forEach(([key, value]) => {
      formData.append(key, value?.toString() ?? '');
    });

    formData.delete("image");

    switch (this.formMode()) {
      case FormMode.Create:
        this.usersService.create(formData).subscribe({
          next: (res) => {
            this.router.navigate([`/settings/users`]);
          },
        });
        break;
      case FormMode.Update:
        this.usersService.put(formData).subscribe({
          next: (res) => {
            this.router.navigate([`/settings/users`]);
          },
        });
        break;
    }
  }
}
