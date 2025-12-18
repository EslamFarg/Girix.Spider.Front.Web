import { Component } from '@angular/core';
import { PurchasesForm } from "../../components/purchases-form/purchases-form";
import { PurchasesNav } from "../../components/purchases-nav/purchases-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-add-purchases',
  imports: [PurchasesForm, PurchasesNav, SectionWrapper],
  templateUrl: './add-purchases.html',
  styleUrl: './add-purchases.css',
})
export class AddPurchases {

}
