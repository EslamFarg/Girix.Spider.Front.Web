import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { FormControl } from '@angular/forms';

export interface IDeliveryFgControls {
  id: FormControl<number | null>;
  nameAr: FormControl<string | null>;
  nameEn:FormControl<string | null>;
  phoneNumber:FormControl<string | null>;
  email:FormControl<string | null>;
  address:FormControl<string | null>;
  description:FormControl<string | null>;
  identityNumber:FormControl<string | null>;
  images: FormControl<File[] | string[] | null[]>
  ImagesAdd?: FormControl<File[] | string[] |null>;
  ListIdsOfDeleteImages?: FormControl<number[]| string[] | null>;
}
