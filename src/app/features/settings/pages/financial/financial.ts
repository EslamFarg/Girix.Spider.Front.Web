import { BaseComponent } from '@/components/base-component/base-component';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, ɵInternalFormsSharedModule } from '@angular/forms';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { InputText } from 'primeng/inputtext';
import { FinancialSettingsService } from '../../services/financial-settings-service';
import { IFinancialSettingsFgControls } from './types';
import { AmountType } from '@/core';
import { AllowNumbers } from '@/directives/allow-numbers';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-financial',
  imports: [
    InputErrorMessageHandler,
    Button,
    InputGroupAddon,
    SectionWrapper,
    InputText,
    ɵInternalFormsSharedModule,
    ReactiveFormsModule,
    AllowNumbers,
    ButtonDirective,
    LoadingDisabledDirective
],
  templateUrl: './financial.html',
  styleUrl: './financial.css',
})
export class Financial extends BaseComponent {
  initialSearchFormValue: IFinancialSettingsFgControls = {
    serviceFeeType: this.fb.control(AmountType.Percentage, [Validators.required]),
    serviceFee: this.fb.control(0, [Validators.required]),
    deliveryFeeType: this.fb.control(AmountType.Percentage, [Validators.required]),
    deliveryFee: this.fb.control(0, [Validators.required]),
    discountType: this.fb.control(AmountType.Percentage, [Validators.required]),
    discount: this.fb.control(0, [Validators.required]),
    vat: this.fb.control(0, []),
    minimumSelectiveTax: this.fb.control(0, []),
  };
  fg = this.fb.group(this.initialSearchFormValue);

  financialSettingsService = inject(FinancialSettingsService);

  constructor() {
    super();
    const changingTypeAmounts = [
      ['serviceFeeType', 'serviceFee'],
      ['deliveryFeeType', 'deliveryFee'],
    ];
    changingTypeAmounts.forEach(([typeControlName, amountControlName]) => {
      this.fg.get(typeControlName)?.valueChanges.subscribe((typeValue) => {
        if (typeValue === AmountType.Percentage) {
          this.fg.get(amountControlName)?.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        } else {
          this.fg
            .get(amountControlName)
            ?.setValidators([Validators.required, Validators.min(0), Validators.max(100_000)]);
        }
        this.fg.get(amountControlName)?.updateValueAndValidity();
      });
    });

    this.financialSettingsService.getSettings().subscribe((res) => this.fg.patchValue(res));
  }

  onSubmit() {
    if (this.fg.valid) {
      this.financialSettingsService.updateSettings(this.fg.value as any).subscribe({
        next: () => this.messageService.add({ severity: 'success', summary: 'تم التعديل بنجاح', detail: '' }),
      });
    }
  }

  log(...data: any) {
    console.log(data);
  }
}
