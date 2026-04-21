import { Component } from '@angular/core';
import { SectionWrapper } from "@/components";
import { ProductComponentsForm } from "../../components/product-components-form/product-components-form";

@Component({
  selector: 'app-product-components',
  imports: [SectionWrapper, ProductComponentsForm],
  templateUrl: './product-components.html',
  styleUrl: './product-components.css',
})
export class ProductComponents {

}
