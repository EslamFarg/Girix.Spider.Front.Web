import { FormControl } from '@angular/forms';

export interface IRestaurantFgControls {
  nameEn: FormControl<string | null>;
  nameAr: FormControl<string | null>;
  phoneNumber: FormControl<string | null>;
  postalCode: FormControl<string | null>;
  vatNumber: FormControl<string | null>;
  commercialRegNo: FormControl<string | null>;
  city: FormControl<string | null>;
  district: FormControl<string | null>;
  buildingNumber: FormControl<string | null>;
  logoUrl: FormControl<string | File | null>;
}
