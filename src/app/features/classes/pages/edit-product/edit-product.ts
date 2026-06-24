import { Component } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-edit-product',
  imports: [ProductForm],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct extends BaseComponent {
}
