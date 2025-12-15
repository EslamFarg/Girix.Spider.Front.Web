import { Component } from '@angular/core';
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputTextModule } from 'primeng/inputtext';
import { BaseComponent } from '@/components/base-component/base-component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [InputErrorMessageHandler,InputTextModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login extends BaseComponent {
  initialFormValue = {
    email: '',
    password: ''
  };
  fg  = this.fb.group(this.initialFormValue);



  onSubmit() {
    window.location.href = '/';
  }
}
