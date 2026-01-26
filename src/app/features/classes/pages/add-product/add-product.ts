import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { ProductForm } from '../../components/product-form/product-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-add-product',
  imports: [SectionWrapper, Button, InputText, InputErrorMessageHandler, ProductForm],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct extends BaseComponent {
}
