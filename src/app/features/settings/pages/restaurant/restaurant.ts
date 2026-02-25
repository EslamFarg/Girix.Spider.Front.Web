import { Component, inject, input, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { Textarea } from 'primeng/textarea';
import { InputText } from 'primeng/inputtext';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { BaseComponent, FormMode } from '@/components';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { IRestaurantFgControls } from './types';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { RestaurantInfoService } from '../../services/restaurant-info-service';

@Component({
  selector: 'app-restaurant',
  imports: [InputErrorMessageHandler, Select, Button, Textarea, InputText, SectionWrapper,ReactiveFormsModule],
  templateUrl: './restaurant.html',
  styleUrl: './restaurant.css',
})
export class Restaurant extends BaseComponent {
  formMode = input.required<FormMode>();
  id = input.required<number>();

  initialGroupFgValue: IRestaurantFgControls = {
    nameAr: this.fb.control<string>('', [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(200),
    ]),
    nameEn: this.fb.control<string>('', [Validators.required]),
    phoneNumber: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(8),
      Validators.maxLength(15),
    ]),
    buildingNumber: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(1),
      Validators.maxLength(10),
    ]),
    city: this.fb.control(null, [Validators.required]),
    district: this.fb.control(null, [Validators.required]),
    commercialRegNo: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(6),
      Validators.maxLength(16),
    ]),
    postalCode: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(3),
      Validators.maxLength(10),
    ]),
    vatNumber: this.fb.control(null, [
      Validators.required,
      onlyNumbersAllowed,
      Validators.minLength(3),
      Validators.maxLength(16),
    ]),
    logoUrl: this.fb.control(null, [Validators.required]),
  };

  restaurantInfoService = inject(RestaurantInfoService);
  fg = this.fb.group(this.initialGroupFgValue);
  /**
   *
   */
  constructor() {
    super();
  }

  ngOnInit() {
    this.restaurantInfoService.getSettings().subscribe({
      next: (settings) => {
        this.fg.patchValue(settings);
      },
    });
  }

  onSubmitForm() {
    this.fg.patchValue({
      nameEn: this.fg.value.nameAr?.trim(),
    });
    if (this.fg.invalid) {
      console.log('invalid');
      console.log(this.fg.value);
      this.fg.markAllAsTouched();
      return;
    }

    const formData = new FormData();

    Array.from(Object.entries(this.fg.value)).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((val) => formData.append(key, val));
      } else {
        formData.append(key, value?.toString() ?? '');
      }
    });

    switch (this.formMode()) {
      case FormMode.Create:
        this.restaurantInfoService.create(formData).subscribe({
          next: (res) => {
            console.log(res);
          },
        });
        break;
      case FormMode.Update:
        this.restaurantInfoService.patch(formData).subscribe({
          next: (res) => {
            console.log(res);
          },
        });
        break;
    }
  }

  //
  //
  //
  //
  //
  //
  //
  //images
  //
  //
  currentImage = signal<IFormImage | null>(null);
  onImagesFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      if (input.files.length > 1) {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يمكن اختيار اكثر من صورة' });
        return;
      }
      this.onDeleteImage();
      const file = input.files[0];

      this.currentImage.set({ file, fullPath: URL.createObjectURL(file), id: 'new-image', ix: 0 });
    }

    this.fg.patchValue({ logoUrl: input.files![0] });

    input.value = '';
  }
  onDeleteImage() {
    if (!this.currentImage()?.file) {
      console.log(this.currentImage()?.id);
      this.fg.patchValue({ logoUrl: null });
    }
    this.currentImage.set(null);
  }
}
