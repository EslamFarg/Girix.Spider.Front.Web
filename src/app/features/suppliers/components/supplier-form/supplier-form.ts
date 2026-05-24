import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { Carousel } from 'primeng/carousel';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { ISupplierFgControls } from './types';
import { SupplierService } from '../../services/supplier-service';
import { ISupplierReadResponse } from '../../services/supplier-types';
import { RouterLink } from '@angular/router';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { AllowNumbers } from '@/directives/allow-numbers';

@Component({
  selector: 'app-supplier-form',
  imports: [
    Button,
    Carousel,
    InputErrorMessageHandler,
    Select,
    InputText,
    Textarea,
    TranslatePipe,
    ButtonDirective,
    ReactiveFormsModule,
    RouterLink,
    LoadingDisabledDirective,
    AllowNumbers,
  ],
  templateUrl: './supplier-form.html',
  styleUrl: './supplier-form.css',
})
export class SupplierForm extends BaseComponent implements OnInit {
  //
  //
  //inputs
  //

  formMode = computed(() => {
    if (this.currentSupplier()) return FormMode.Update;
    return this.initialFormMode();
  });
  id = input.required<number | null>();

  //
  //
  //state
  //

  initialSupplierFgValue: ISupplierFgControls = {
    id: this.fb.control(null, []),
    nameAr: this.fb.control(null, [Validators.required, noSymbolsAllowed]),
    nameEn: this.fb.control(null, [ noSymbolsAllowed]),
    phoneNumber: this.fb.control(null, [
      
      onlyNumbersAllowed,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
    secondaryMobileNumber: this.fb.control(null, [ onlyNumbersAllowed]),
    city: this.fb.control(null, []),
    district: this.fb.control(null, []),
    street: this.fb.control(null, []),
    buildingNumber: this.fb.control(null, [ onlyNumbersAllowed]),
    apartment: this.fb.control(null, [ onlyNumbersAllowed]),
    landmark: this.fb.control(null, []),
    postalCode: this.fb.control(null, [ onlyNumbersAllowed]),
    commercialRegister: this.fb.control(null, [
      
      onlyNumbersAllowed,
      // Validators.minLength(10),
      Validators.maxLength(10),
    ]),
    taxNumber: this.fb.control(null, [
      
      // Validators.minLength(15),
      Validators.maxLength(15),
      onlyNumbersAllowed,
      // Validators.pattern(/^3.*3$/),
    ]),
    numberOfFloor: this.fb.control(null, [ onlyNumbersAllowed]),
    isCompany: this.fb.control(false, []),
  };

  supplierFg = this.fb.group(this.initialSupplierFgValue);

  //services
  supplierService = inject(SupplierService);
  currentSupplier = signal<ISupplierReadResponse | null>(null);

  /**
   *
   */

  //
  //
  //
  //
  ngOnInit(): void {
    switch (this.formMode()) {
      case FormMode.Create:
        break;
      case FormMode.Update:
        //fetch
        this.supplierService.getById(this.id()!).subscribe((Supplier) => {
          this.currentSupplier.set(Supplier);
          //-> bind data
          console.log('supplier', Supplier);
          this.supplierFg.patchValue({ ...Supplier, nameAr: Supplier.name, nameEn: Supplier.name });
        });
        break;
    }
  }

  onSubmitForm() {
    this.supplierFg.patchValue({
      nameEn: this.supplierFg.value.nameAr?.trim(),
      landmark: this.supplierFg.value.numberOfFloor,
    });

    console.log(this.supplierFg.value);
    if (this.supplierFg.invalid) {
      this.supplierFg.markAllAsTouched();
      return;
    }

    // let dto={}

    switch (this.formMode()) {
      case FormMode.Create:
        this.supplierService.create(this.supplierFg.value).subscribe({
          next: (res) => {
            this.router.navigate(['/suppliers']);
          },
        });
        break;
      case FormMode.Update:
        this.supplierService.put({ ...this.supplierFg.value, id: Number(this.id()) }).subscribe({
          next: (res) => {
            this.router.navigate(['/suppliers']);
          },
        });
        break;
    }
  }
}
