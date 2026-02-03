import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { FormControl } from '@angular/forms';

export interface IDeliveryFgControls {
  id: FormControl<number | null>;
  nameAr: FormControl<string | null>;
}
