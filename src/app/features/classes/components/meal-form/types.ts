import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { FormControl } from '@angular/forms';

export interface IMealFgControls {
  id: FormControl<number | null>;
  nameAr: FormControl<string | null>;
  nameEn: FormControl<string | null>;
  price: FormControl<number | null>;
  categoryId: FormControl<number | null>;
  costPrice: FormControl<number | null>;
  tax: FormControl<number | null>;
  selectiveTax: FormControl<number | null>;
  descriptionAr: FormControl<string | null>;
  descriptionEn: FormControl<string | null>;
  menuItems: FormControl<{ id: number; quantity: number }[] | null>;
  images: FormControl<File[] | null>;
  imagesAdd: FormControl<File[] | null>;
  allImages: FormControl<IFormImage[] | null>;
  ListIdsOfDeleteImages: FormControl<number[] | null>;
}
