import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { ProductsNav } from "../../components/products-nav/products-nav";
import { Button } from "primeng/button";
import { InputText } from "primeng/inputtext";
import { InputErrorMessageHandler } from "@/components/input-error-message-handler/input-error-message-handler";
import { ProductForm } from "../../components/product-form/product-form";

@Component({
  selector: 'app-add-product',
  imports: [GroupsNav, SectionWrapper, ProductsNav, Button, InputText, InputErrorMessageHandler, ProductForm],
  templateUrl: './add-product.html',
  styleUrl: './add-product.css',
})
export class AddProduct {

}
