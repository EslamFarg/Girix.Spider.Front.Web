import { Component } from '@angular/core';
import { PurchasesRefundsNav } from "../../components/purchases-refunds-nav/purchases-refunds-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { PurchasesRefundsForm } from "../../components/purchases-refunds-form/purchases-refunds-form";

@Component({
  selector: 'app-add-purchases-refunds',
  imports: [PurchasesRefundsNav, SectionWrapper, PurchasesRefundsForm],
  templateUrl: './add-purchases-refunds.html',
  styleUrl: './add-purchases-refunds.css',
})
export class AddPurchasesRefunds {

}
