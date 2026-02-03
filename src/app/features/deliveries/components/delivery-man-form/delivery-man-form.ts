import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { noSymbolsAllowed } from '@/yn-ng/utils/text-validators';
import { IDeliveryFgControls } from './types';
import { DeliveryService } from '../../services/delivery-service';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';

@Component({
  selector: 'app-delivery-man-form',
  imports: [Button, InputErrorMessageHandler, InputText, Textarea, ReactiveFormsModule, ButtonDirective],
  templateUrl: './delivery-man-form.html',
  styleUrl: './delivery-man-form.css',
})
export class DeliveryManForm extends BaseComponent implements OnInit {
  //inputs FROM PARENT
  formMode = input.required<FormMode>();
  id = input.required<number | null>();
  //
  //
  //

  initialDeliveryFgValue: IDeliveryFgControls = {
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),
    //
    //
    //update only props
    id: this.fb.control(null, []),
  };

  deliveryFg = this.fb.group(this.initialDeliveryFgValue);

  //services
  deliveryService = inject(DeliveryService);

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
        this.deliveryService.getById(this.id()!).subscribe((delivery) => {
          //-> bind data

          this.currentImage.set(delivery.attachment[0]);
        });
        break;
    }
  }

  onSubmitForm() {
    if (this.deliveryFg.invalid) {
      this.deliveryFg.markAllAsTouched();
      return;
    }

    const formData = null;

    switch (this.formMode()) {
      case FormMode.Create:
        this.deliveryService.create(formData).subscribe({
          next: (res) => {
            console.log(res);
            this.messageService.add({
              severity: 'info',
              summary: 'YOUR TITLE',
              detail: 'MESSAGE MESSAGE MESSAGE MESSAGE MESSAGE',
            });
          },
        });
        break;
      case FormMode.Update:
        this.deliveryService.put(formData).subscribe({
          next: (res) => {
            console.log(res);
            this.messageService.add({
              severity: 'info',
              summary: 'YOUR TITLE',
              detail: 'MESSAGE MESSAGE MESSAGE MESSAGE MESSAGE',
            });
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
      const file = input.files[0];

      this.currentImage.set({ file, fullPath: URL.createObjectURL(file), id: 'new-image', ix: 0 });

      //bind to form
    }

    input.value = '';
  }
  onDeleteImage() {
    this.currentImage.set(null);
  }
}
