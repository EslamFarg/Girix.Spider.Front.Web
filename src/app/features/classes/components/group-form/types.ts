import { FormControl } from '@angular/forms';

export interface IGroupFgControls {
  id: FormControl<number|null>;
  nameEn: FormControl<string | null>;
  nameAr: FormControl<string | null>;
  printerId: FormControl<number | null>;
  isOnCasher: FormControl<boolean>;
  images: FormControl<File[] | null>;
  listIdsOfDeleteImages: FormControl<number[] | null>;
  imagesAdd: FormControl<File[] | null>;
  description: FormControl<string | null>;
}
