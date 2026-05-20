import { Component, inject, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { emailValidator, InputErrorMessageHandler, noSymbolsAllowed, onlyNumbersAllowed } from '@/yn-ng';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { SectionWrapper } from '@/components';
import { BaseComponent } from '@/components';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { IUserReadResponse, UserService, IUserFgControls, UserType } from '@/features/users';
import { FinancialAccountService } from '@/features/accounts/services/financial-account-service';
import { TranslatePipe } from '@ngx-translate/core';
import { IFormImage } from '@/yn-ng/types/forms/IFormImage';
import { ImgFallback } from '@/directives/img-fallback';
import { LoadingDisabledDirective } from "@/directives/loading-disabled";

@Component({
  selector: 'app-profile',
  imports: [
    Button,
    InputErrorMessageHandler,
    Select,
    InputText,
    Textarea,
    SectionWrapper,
    ReactiveFormsModule,
    ImgFallback,
    LoadingDisabledDirective
],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile extends BaseComponent {
  initialusersFgValue: IUserFgControls = {
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

    phoneNumber: this.fb.control(null, [
      Validators.required,
      Validators.minLength(8),
      onlyNumbersAllowed,
      Validators.maxLength(13),
    ]),
    isActive: this.fb.control(true, [Validators.required]),
    email: this.fb.control(null, [Validators.required, emailValidator]),
    //ids
    groupId: this.fb.control(null, []),
    cashierCollectionAccountId: this.fb.control(null, []),
    custodyAccountId: this.fb.control(null, []),
    cashPaymentAccountId: this.fb.control(null, []),
    bankPaymentAccountId: this.fb.control(null, []),
    image: this.fb.control(null, []),
    //update only
    userId: this.fb.control(null, []),
  };

  userFg = this.fb.group(this.initialusersFgValue);

  //services
  usersService = inject(UserService);

  userTypes = signal([
    { id: UserType.Admin, name: 'Admin' },
    { id: UserType.Cashier, name: 'Cashier' },
    { id: UserType.Waiter, name: 'Waiter' },
  ]);

  /**
   *
   */
  constructor() {
    super();
    this.usersService.getById(+this.authService.userDetails()!.userId).subscribe((user: IUserReadResponse) => {
      this.userFg.patchValue({ ...user, nameAr: user.name!, nameEn: user.name! });
      if (user.imageUrl) {
        this.currentImage.set({
          fullPath: this.baseUrl + user.imageUrl,
        });
      }
    });
  }

  onSubmitForm() {
    this.userFg.patchValue({
      nameEn: this.userFg.value.nameAr?.trim(),
    });

    // debugger;
    if (this.userFg.invalid) {
      this.userFg.markAllAsTouched();
      console.log(this.userFg.value);
      return;
    }

    // let dto:{[key:string] : string | number}={};

    // Object.entries(this.userFg.value).forEach(([key, value]:[string,any]) => {
    //   if (Array.isArray(value)) {
    //     value.forEach((val) => {
    //       dto[key]=val
    //     });
    //   }else{
    //     dto[key]=value
    //   }
    // })

    // console.log(dto);
    const formData = new FormData();

    Object.entries(this.userFg.value).forEach(([key, value]: [string, any]) => {
      formData.append(key, value);
    });

    if(!this.currentImage()?.file){
      formData.delete('image');
    }

    this.usersService.put(formData).subscribe();
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

    this.userFg.patchValue({ image: input.files![0] });

    input.value = '';
  }
  onDeleteImage() {
    this.userFg.patchValue({ image: null });
    this.currentImage.set(null);
  }
}
