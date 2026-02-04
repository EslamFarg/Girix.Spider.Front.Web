import { Component, inject, input, signal } from '@angular/core';
import { InputErrorMessageHandler } from '@/yn-ng/components/input-error-message-handler/input-error-message-handler';
import { Button, ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { BaseComponent, FormMode } from '@/components/base-component/base-component';
import { TranslatePipe } from '@ngx-translate/core';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng/utils/text-validators';
import { IusersFgControls } from './types';
import { UserService } from '../../services/user-service';
// import { IusersFgControls } from '@/features/deliveries/components/users-man-form/types';
// import { usersService } from '@/features/deliveries/services/users-service';

@Component({
  selector: 'app-user-form',
  imports: [InputErrorMessageHandler, Button, InputText, Textarea,ButtonDirective, Select,TranslatePipe,ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm extends BaseComponent{

  formMode = input.required<FormMode>();
  id=input.required<number | null>();



  initialusersFgValue: IusersFgControls = {
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
    groupId:this.fb.control(null,[Validators.required]),
    
    // description:this.fb.control(null,[Validators.required]),
    // identityNumber:this.fb.control(null,[Validators.required,onlyNumbersAllowed,Validators.minLength(14),Validators.maxLength(14)]),
    // images: this.fb.control([], [Validators.required]),
    //update only props
    id: this.fb.control(null, []),
  };

  usersFg = this.fb.group(this.initialusersFgValue);

  //services
  usersService = inject(UserService);
  currentusers: any;

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
        this.usersService.getById(this.id()!).subscribe((users) => {
          //-> bind data

          this.currentusers.set(users)
            
          this.usersFg.patchValue({
            nameAr: users.name,
            ...users,
            // ImagesAdd: [],
          });

          console.log(this.usersFg.value);
     
          console.log(users.attachment[0].fullPath);
          this.currentImage.set({
            
            fullPath: this.baseUrl+users.attachment[0].fullPath,
            id: users.attachment[0].id,
          });
          // this.usersFg.patchValue({
          //   images: [users.attachment[0].fullPath],
          // });
        });
        break;
    }
  }

  onSubmitForm() {
    this.usersFg.patchValue({
      nameEn: this.usersFg.value.nameAr?.trim(),
    })
    

  
    // debugger;
    if (this.usersFg.invalid) {
      this.usersFg.markAllAsTouched();
      return;
    }


    const formData = new FormData();


    Object.entries(this.usersFg.value).forEach(([key, value]:[string, any]) => {

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
        this.usersService.create(formData).subscribe();
        break;
      case FormMode.Update:
        // formData.append('images','');
        
        if(this.currentImage()?.file){

          formData.delete('images');
          formData.append('imagesAdd', this.currentImage()!.file!);
     
        }
        console.log(formData);
        this.usersService.put(formData).subscribe();
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

    console.log(this.usersFg.value);
  }
  onDeleteImage() {
    this.currentImage.set(null);
  }

  
}
