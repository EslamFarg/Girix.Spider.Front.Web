import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Button, ButtonDirective } from 'primeng/button';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { IDeliveryFgControls } from './types';
import { DeliveryService, IDeliveryReadResponse } from '../../services/delivery-service';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-delivery-man-form',
  imports: [Button, InputErrorMessageHandler, InputText, Textarea, ReactiveFormsModule, ButtonDirective,TranslatePipe],
  templateUrl: './delivery-man-form.html',
  styleUrl: './delivery-man-form.css',
})
export class DeliveryManForm extends BaseComponent implements OnInit {
  //inputs FROM PARENT
  formMode = input.required<FormMode>();
  id = input.required<number | null>();
  //
  //
currentDelivery = signal<IDeliveryReadResponse|null>(null)
  //
  //

  initialDeliveryFgValue: IDeliveryFgControls = {
    nameAr: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),

    nameEn: this.fb.control(null, [
      Validators.required,
      noSymbolsAllowed,
      Validators.minLength(3),
      Validators.maxLength(100),
    ]),

    phoneNumber:this.fb.control(null, [Validators.required, Validators.minLength(8), onlyNumbersAllowed,Validators.maxLength(13)]),
    email:this.fb.control(null,[Validators.required,emailValidator]),
    address:this.fb.control(null,[Validators.required]),
    description:this.fb.control(null,[Validators.required]),
    identityNumber:this.fb.control(null,[Validators.required,onlyNumbersAllowed,Validators.minLength(14),Validators.maxLength(14)]),
    images: this.fb.control([], [Validators.required]),
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

          this.currentDelivery.set(delivery)
            
          this.deliveryFg.patchValue({
            nameAr: delivery.name,
            ...delivery,
            // ImagesAdd: [],
          });

          console.log(this.deliveryFg.value);
     
          console.log(delivery.attachment[0].fullPath);
          this.currentImage.set({
            
            fullPath: this.baseUrl+delivery.attachment[0].fullPath,
            id: delivery.attachment[0].id,
          });
          this.deliveryFg.patchValue({
            images: [delivery.attachment[0].fullPath],
          });
        });
        break;
    }
  }

  onSubmitForm() {
    this.deliveryFg.patchValue({
      nameEn: this.deliveryFg.value.nameAr?.trim(),
    })
    

    console.log(this.deliveryFg.value);
    if(!this.currentImage() || this.deliveryFg.get('images')?.value.length === 0){
          this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يمكن ان يكون الصورة فارغة' });
          return;
    }
    // debugger;
    if (this.deliveryFg.invalid) {
      this.deliveryFg.markAllAsTouched();
      return;
    }


    const formData = new FormData();


    Object.entries(this.deliveryFg.value).forEach(([key, value]:[string, any]) => {

      if(Array.isArray(value)){
        value.forEach((val)=>{
          formData.append(key, val);
        })
      }else{
        formData.append(key, value);
      }
    })


    // console.log(formData);

    switch (this.formMode()) {
      case FormMode.Create:
        this.deliveryService.create(formData).subscribe();
        break;
      case FormMode.Update:
        // formData.append('images','');
        
        if(this.currentImage()?.file){

          formData.delete('images');
          formData.append('imagesAdd', this.currentImage()!.file!);
          this.currentDelivery()!.attachment.forEach((image) => {
            formData.append('listIdsOfDeleteImages', (image.id).toString());
          })
        }
        console.log(formData);
        this.deliveryService.put(formData).subscribe();
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

      this.deliveryFg.patchValue({
        images: [],
      })
      

      if (input.files.length > 1) {
        this.messageService.add({ severity: 'error', summary: 'خطأ', detail: 'لا يمكن اختيار اكثر من صورة' });
        return;
      }
      const file = input.files[0];

      this.currentImage.set({ file, fullPath: URL.createObjectURL(file), id: 'new-image', ix: 0 });

      //bind to form



      this.deliveryFg.patchValue({
        images: [file],
      });
    }

    input.value = '';

    console.log(this.deliveryFg.value);
  }
  onDeleteImage() {
    this.currentImage.set(null);
  }
}
