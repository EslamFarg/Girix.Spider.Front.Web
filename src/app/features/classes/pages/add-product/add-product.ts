import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputErrorMessageHandler } from '@/components/input-error-message-handler/input-error-message-handler';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-add-product',
  imports: [SectionWrapper, Button, InputText, InputErrorMessageHandler, ProductForm],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {}
