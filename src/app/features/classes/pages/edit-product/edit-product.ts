import { Component } from '@angular/core';
import { GroupsNav } from "../../components/groups-nav/groups-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { ProductsNav } from "../../components/products-nav/products-nav";
import { Button } from "primeng/button";

@Component({
  selector: 'app-edit-product',
  imports: [GroupsNav, SectionWrapper, ProductsNav, Button],
  templateUrl: './edit-product.html',
  styleUrl: './edit-product.css',
})
export class EditProduct {

}
