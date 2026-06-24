import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import {
  emailValidator,
  noSymbolsAllowed,
  onlyNumbersAllowed,
} from '@/yn-ng/utils/text-validators';
import { IDeliveryFgControls } from './types';
import { DeliveryService, IDeliveryReadResponse } from '../../services/delivery-service';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { TranslatePipe } from '@ngx-translate/core';
import { LoadingDisabledDirective } from '@/directives/loading-disabled';
import { ImgFallback } from '@/directives/img-fallback';
import { ImgOnly } from '@/directives/img-only';

@Component({
  selector: 'app-delivery-man-form',
  imports: [
    InputErrorMessageHandler,
    InputText,
    Textarea,
    ReactiveFormsModule,
    ButtonDirective,
    TranslatePipe,
    LoadingDisabledDirective,
    ImgFallback,
    ImgOnly,
  ],
  templateUrl: './delivery-man-form.html',
  styleUrl: './delivery-man-form.css',
})
export class DeliveryManForm extends BaseComponent {
  id = input.required<number>();
  singleScreenMode = input<boolean>(false);
  afterSave = output<void>();
  afterReset = output<void>();

  formMode = computed(() => {
    if (this.currentDelivery()) return FormMode.Update;
    return this.initialFormMode();
  });

  currentDelivery = signal<IDeliveryReadResponse | null>(null);

  initialDeliveryFgValue: IDeliveryFgControls = {
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    nameEn: this.fb.control(null, []),
    phoneNumber: this.fb.control(null, [
      Validators.required,
      Validators.minLength(6),
      onlyNumbersAllowed,
      Validators.maxLength(14),
    ]),
    email: this.fb.control('', [emailValidator]),
    address: this.fb.control('', [Validators.required]),
    description: this.fb.control('', []),
    identityNumber: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(10),
      Validators.maxLength(14),
    ]),
    images: this.fb.control([], []),
    id: this.fb.control(null, []),
  };

  deliveryFg = this.fb.group(this.initialDeliveryFgValue);
  deliveryService = inject(DeliveryService);
  currentImage = signal<IFormImage | null>(null);

  constructor() {
    super();

    effect(() => {
      const id = this.id();
      const mode = this.initialFormMode();

      this._resetFormState();

      if (id > 0 && mode === FormMode.Update) {
        this.deliveryService.getById(id).subscribe({
          next: (delivery) => {
            this.currentDelivery.set(delivery);
            this.deliveryFg.patchValue({
              id: delivery.id,
              nameAr: delivery.name,
              nameEn: delivery.name,
              phoneNumber: delivery.phoneNumber,
              email: delivery.email ?? '',
              address: delivery.address,
              description: delivery.description ?? '',
              identityNumber: delivery.identityNumber,
            });

            if (delivery.attachment.length > 0) {
              this.currentImage.set({
                fullPath: this.baseUrl + delivery.attachment[0]?.fullPath,
                id: delivery.attachment[0]?.id,
              });
              this.deliveryFg.patchValue({
                images: [delivery.attachment[0]?.fullPath],
              });
            }
          },
        });
      }
    });
  }

  private _resetFormState() {
    this.currentDelivery.set(null);
    this.currentImage.set(null);
    this.deliveryFg.reset({
      nameAr: null,
      nameEn: null,
      phoneNumber: null,
      email: '',
      address: '',
      description: '',
      identityNumber: null,
      images: [],
      id: null,
    });
  }

  onSubmitForm() {
    this.deliveryFg.patchValue({
      nameAr: this.deliveryFg.get('nameAr')?.value ?? this.deliveryFg.get('nameEn')?.value,
      nameEn: this.deliveryFg.get('nameAr')?.value,
    });

    if (this.deliveryFg.invalid) {
      this.deliveryFg.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    Object.entries(this.deliveryFg.value).forEach(([key, value]: [string, unknown]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => formData.append(key, val as string | Blob));
      } else if (value != null) {
        formData.append(key, value as string);
      }
    });

    switch (this.formMode()) {
      case FormMode.Create:
        this.deliveryService.create(formData).subscribe({
          next: () => {
            if (this.singleScreenMode()) {
              this._resetFormState();
              this.afterSave.emit();
            } else {
              this.router.navigateByUrl('/classes/deliveries');
            }
          },
        });
        break;
      case FormMode.Update:
        if (this.currentImage()?.file) {
          formData.delete('images');
          formData.append('imagesAdd', this.currentImage()!.file!);
          this.currentDelivery()!.attachment.forEach((image) => {
            formData.append('listIdsOfDeleteImages', image.id.toString());
          });
        }
        this.deliveryService.put(formData).subscribe({
          next: () => {
            if (this.singleScreenMode()) {
              this._resetFormState();
              this.afterSave.emit();
            } else {
              this.router.navigateByUrl('/classes/deliveries');
            }
          },
        });
        break;
    }
  }

  onResetForm() {
    if (this.singleScreenMode()) {
      this._resetFormState();
      this.afterReset.emit();
    } else if (this.formMode() === FormMode.Create) {
      this._resetFormState();
    } else {
      this.router.navigateByUrl('/classes/deliveries/add');
    }
  }

  onImagesFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.deliveryFg.patchValue({ images: [] });

      if (input.files.length > 1) {
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'لا يمكن اختيار اكثر من صورة',
        });
        return;
      }

      const file = input.files[0];
      this.currentImage.set({ file, fullPath: URL.createObjectURL(file), id: 'new-image', ix: 0 });
      this.deliveryFg.patchValue({ images: [file] });
    }

    input.value = '';
  }

  onDeleteImage() {
    this.currentImage.set(null);
    this.deliveryFg.patchValue({
      ListIdsOfDeleteImages: [this.currentImage()?.id],
    });
  }
}
