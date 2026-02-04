import { FormControl } from "@angular/forms"

export interface IusersFgControls{
  id?:FormControl<number | null>
  nameAr: FormControl<string | null>
  nameEn: FormControl<string | null>
  email: FormControl<string | null>
  phoneNumber: FormControl<number | null>
  groupId: FormControl<number | null>
//   cashierCollectionAccountId: number
//   custodyAccountId: number
//   cashPaymentAccountId: number
//   bankPaymentAccountId: number
}