import { Component, inject, input, signal } from '@angular/core';
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
import { IusersFgControls } from './types';
import { UserService } from '../../services/user-service';
import { FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import {
  IBankFinancialAccount,
  ICashFinancialAccount,
  ICustodyFinancialAccount,
} from '@/features/accounts/services/financial-account-types';
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
  ],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm extends BaseComponent {
  formMode = input.required<FormMode>();
  id = input.required<number | null>();

  initialusersFgValue: IusersFgControls = {
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
    email: this.fb.control(null, [Validators.required, emailValidator]),
    groupId: this.fb.control(null, [Validators.required]),
    id: this.fb.control(null, []),
  };

  userFg = this.fb.group(this.initialusersFgValue);

  //services
  usersService = inject(UserService);
  financialAccountsService = inject(FinancialAccountService);
  currentusers: any;

  //
  cashFinancialAccounts = signal<ICashFinancialAccount[]>([]);
  bankFinancialAccounts = signal<IBankFinancialAccount[]>([]);
  custodyAccounts = signal<ICustodyFinancialAccount[]>([]);

  userTypes = signal([
    { id: 1, nameAr: 'Admin', nameEn: 'Admin' },
    { id: 2, nameAr: 'Casher', nameEn: 'Casher' },
    { id: 3, nameAr: 'Waiter', nameEn: 'Waiter' },
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
        this.usersService.getById(this.id()!).subscribe((users) => {
          //-> bind data
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

    // switch (this.formMode()) {
    //   case FormMode.Create:
    //     this.usersService.create(dto).subscribe();
    //     break;
    //   case FormMode.Update:

    //     this.usersService.put(dto).subscribe();
    //     break;
    // }
  }
}
