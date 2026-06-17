import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputText } from 'primeng/inputtext';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { onlyLettersAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { ICustomerFgControls } from './types';
import { CustomerService } from '../../services/customer-service';
import { ICustomerReadResponse } from '../../services/customer-types';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { AllowNumbers } from '@/directives/allow-numbers';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
@Component({
    selector: 'app-customer-form',
    imports: [
        InputErrorMessageHandler,
        InputText,
        TranslatePipe,
        ButtonDirective,
        ReactiveFormsModule,
        LoadingDisabledDirective,
        AllowNumbers,
        ToggleSwitchModule,
    ],
    templateUrl: './customer-form.html',
    styleUrl: './customer-form.css',
})
export class CustomerForm extends BaseComponent implements OnInit {
    //
    //
    //inputs
    //

    formMode = computed(() => {
        if (this.currentCustomer()) return FormMode.Update;
        return this.initialFormMode();
    });
    id = input.required<number | null>();

    //
    //
    //state
    //

    initialCustomerFgValue: ICustomerFgControls = {
        id: this.fb.control(null, []),
        nameAr: this.fb.control(null, [Validators.required, onlyLettersAllowed ]),
        nameEn: this.fb.control(null, [onlyLettersAllowed]),
        phoneNumber: this.fb.control(null, [
            // ,
            onlyNumbersAllowed,
            // Validators.minLength(6),
            Validators.maxLength(14),
        ]),
        secondaryMobileNumber: this.fb.control(null, [
            // Validators.required,
            onlyNumbersAllowed,
            // Validators.minLength(6),
            Validators.maxLength(14),
        ]),
        city: this.fb.control(null, [Validators.maxLength(100)]),
        district: this.fb.control(null, [Validators.maxLength(100)]),
        street: this.fb.control(null, [Validators.maxLength(100)]),
        buildingNumber: this.fb.control(null, [onlyNumbersAllowed , Validators.maxLength(100)]),
        apartment: this.fb.control(null, [onlyNumbersAllowed , Validators.maxLength(100)]),
        landmark: this.fb.control(null, [Validators.maxLength(100)]),
        postalCode: this.fb.control(null, [onlyNumbersAllowed , Validators.maxLength(100)]),
        commercialRegister: this.fb.control(null, [
            // ,
            onlyNumbersAllowed,
            // Validators.minLength(10),
            Validators.maxLength(10),
        ]),
        //ends and starts with  3
        taxNumber: this.fb.control(null, [
            Validators.minLength(15),
            Validators.maxLength(15),
            onlyNumbersAllowed,
            Validators.pattern(/^3.*3$/),
        ]),
        numberOfFloor: this.fb.control(null, [onlyNumbersAllowed , Validators.maxLength(100)]),
        isCompany: this.fb.control(false, []),
        consumeInventory: this.fb.control(true, []),
    };

    customerFg = this.fb.group(this.initialCustomerFgValue);

    //services
    customerService = inject(CustomerService);
    currentCustomer = signal<ICustomerReadResponse | null>(null);

    /**
     *
     */

    //
    //
    //
    //
    ngOnInit(): void {
        this.customerFg.get('isCompany')?.valueChanges.subscribe((isCompany) => {
            const phoneNumber = this.customerFg.get('phoneNumber');
            const commercialRegister = this.customerFg.get('commercialRegister');
            const taxNumber = this.customerFg.get('taxNumber');

            if (isCompany) {
                phoneNumber?.setValidators([Validators.required, onlyNumbersAllowed, Validators.maxLength(14)]);
                commercialRegister?.setValidators([Validators.required, onlyNumbersAllowed, Validators.maxLength(10)]);
                taxNumber?.setValidators([
                    Validators.required,
                    Validators.minLength(15),
                    Validators.maxLength(15),
                    onlyNumbersAllowed,
                    Validators.pattern(/^3.*3$/),
                ]);
            } else {
                phoneNumber?.setValidators([onlyNumbersAllowed, Validators.maxLength(14)]);
                commercialRegister?.clearValidators();
                commercialRegister?.setValidators([onlyNumbersAllowed, Validators.maxLength(10)]);
                taxNumber?.clearValidators();
                taxNumber?.setValidators([Validators.maxLength(15), onlyNumbersAllowed, Validators.pattern(/^3.*3$/)]);
            }

            phoneNumber?.updateValueAndValidity();
            commercialRegister?.updateValueAndValidity();
            taxNumber?.updateValueAndValidity();
        });

        switch (this.formMode()) {
            case FormMode.Create:
                break;
            case FormMode.Update:
                this.customerService.getById(this.id()!).subscribe((Customer) => {
                    this.currentCustomer.set(Customer);
                    this.customerFg.patchValue({
                        ...Customer,
                        nameAr: Customer.name,
                        nameEn: Customer.name,
                    });
                });
                break;
        }
    }

    onSubmitForm() {
        this.customerFg.patchValue({
            nameEn: this.customerFg.value.nameAr?.trim(),
            landmark: this.customerFg.value.numberOfFloor,
        });
        this.customerFg.updateValueAndValidity();
        if (this.customerFg.invalid) {
            this.customerFg.markAllAsTouched();
            return;
        }

        // let dto={}

        switch (this.formMode()) {
            case FormMode.Create:
                this.customerService.create(this.customerFg.value).subscribe({
                    next: (res) => {
                        this.router.navigate(['/accounts/customers']);
                    },
                });
                break;
            case FormMode.Update:
                this.customerService.put({ ...this.customerFg.value, id: Number(this.id()) }).subscribe({
                    next: (res) => {
                        this.router.navigate(['/accounts/customers']);
                    },
                });
                break;
        }
    }
    onResetForm() {
        if (this.formMode() === FormMode.Create) {
            this.customerFg.reset();
        } else {
            this.router.navigateByUrl('/accounts/customers/add');
        }
    }
    deleteCustomer(id: number, event: Event) {
        this.confirmationService.confirm({
            target: event.target as EventTarget,
            message: 'هل انت متاكد من حذف العميل',
            header: 'حذف العميل',
            icon: 'pi pi-info-circle',
            rejectLabel: 'الغاء',
            rejectButtonProps: {
                label: 'الغاء',
                severity: 'secondary',
                outlined: true,
            },
            acceptButtonProps: {
                label: 'حذف',
                severity: 'danger',
            },

            accept: () => {
                this.customerService.delete(id).subscribe({
                    next: () => {
                        this.router.navigateByUrl('/accounts/customers/add');
                    },
                });
            },
        });
    }
}
