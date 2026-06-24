import { Component } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-add-product',
  imports: [ProductForm],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct extends BaseComponent {}
