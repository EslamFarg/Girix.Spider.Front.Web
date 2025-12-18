import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { InputTextModule  } from "primeng/inputtext";

import { SelectModule } from 'primeng/select';
import { CarouselModule } from 'primeng/carousel';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-product-form',
  imports: [Button, InputErrorMessageHandler, InputTextModule,SelectModule,CarouselModule,TextareaModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {

}
