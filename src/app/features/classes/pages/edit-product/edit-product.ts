import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { Button } from 'primeng/button';
import { ProductForm } from '../../components/product-form/product-form';
import { BaseComponent } from '@/components/base-component/base-component';

@Component({
  selector: 'app-edit-product',
  imports: [SectionWrapper, Button, ProductForm],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct extends BaseComponent {
}
