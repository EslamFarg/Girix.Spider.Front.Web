import { FormControl } from '@angular/forms';

export interface ICustomerFgControls {
  id?: FormControl<number | null>
  nameAr: FormControl<string | null>
  nameEn: FormControl<string | null>
  phoneNumber: FormControl<string | null>
  secondaryMobileNumber: FormControl<string | null>
  city: FormControl<string | null>
  district: FormControl<string | null>
  street: FormControl<string | null>
  buildingNumber: FormControl<string | null>
  apartment: FormControl<string | null>
  landmark: FormControl<string | null | number>
  postalCode: FormControl<string | null>
  commercialRegister: FormControl<string | null>
  taxNumber: FormControl<string | null>
  numberOfFloor: FormControl<number | null>
  isCompany: FormControl<boolean | null>
  consumeInventory: FormControl<boolean | null>
}
