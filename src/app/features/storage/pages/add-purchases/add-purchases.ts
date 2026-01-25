import { Component } from '@angular/core';
import { PurchasesForm } from "../../components/purchases-form/purchases-form";
 import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-add-purchases',
  imports: [PurchasesForm,  SectionWrapper],
  templateUrl: './add-purchases.html',
  styleUrl: './add-purchases.css',
})
export class AddPurchases {

}
