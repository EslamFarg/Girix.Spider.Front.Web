import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputText } from "primeng/inputtext";
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-product-form',
  imports: [Button, InputErrorMessageHandler, InputText,SelectModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {

}
