import { BaseComponent } from '@/components/base-component/base-component';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { Password } from "primeng/password";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, InputErrorMessageHandler, Password, Button, InputText],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword  extends BaseComponent {
  initialFormValue = {
    email: '',
    password: ''
  };
  fg  = this.fb.group(this.initialFormValue);



  onSubmit() {
    window.location.href = '/';
  }
}
