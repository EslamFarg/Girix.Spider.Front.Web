import { Component } from '@angular/core';
import { NgSelectComponent, NgPlaceholderTemplateDirective } from "@ng-select/ng-select";

@Component({
  selector: 'app-auth',
  imports: [NgSelectComponent, NgPlaceholderTemplateDirective],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  isShowPassword=false;
}
