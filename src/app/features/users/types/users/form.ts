import { FormControl } from '@angular/forms';

export interface IUserFgControls {
  userId?: FormControl<number | null>;
  nameAr: FormControl<string | null>;
  nameEn: FormControl<string | null>;
  email: FormControl<string | null>;
  phoneNumber: FormControl<string | null>;
  groupId: FormControl<number | null>;
  cashierCollectionAccountId: FormControl<number | null>;
  custodyAccountId: FormControl<number | null>;
  cashPaymentAccountId: FormControl<number | null>;
  bankPaymentAccountId: FormControl<number | null>;
  isActive: FormControl<boolean>;
  image: FormControl<File | null>;
  //   cashierCollectionAccountId: number
  //   custodyAccountId: number
  //   cashPaymentAccountId: number
  //   bankPaymentAccountId: number
}
