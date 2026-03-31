import { Component } from '@angular/core';
 import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { PurchasesRefundsForm } from "../../components/purchases-refunds-form/purchases-refunds-form";

@Component({
  selector: 'app-add-purchase-return',
  imports: [  SectionWrapper, PurchasesRefundsForm],
  templateUrl: './add-purchase-return.html',
  styleUrl: './add-purchase-return.css',
})
export class AddPurchaseReturn {

}
