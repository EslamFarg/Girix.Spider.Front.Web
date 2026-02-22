import { AmountType } from '@/core';
import { FormControl } from '@angular/forms';

export interface IFinancialSettingsFgControls {
  serviceFeeType: FormControl<AmountType>;
  serviceFee: FormControl<number>;
  deliveryFeeType: FormControl<AmountType>;
  deliveryFee: FormControl<number>;
  discountType: FormControl<AmountType>;
  discount: FormControl<number>;
  vat: FormControl<number>;
  minimumSelectiveTax: FormControl<number>;
}
