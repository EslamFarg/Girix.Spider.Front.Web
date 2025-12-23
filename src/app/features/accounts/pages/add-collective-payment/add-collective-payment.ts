import { Component } from '@angular/core';
import { CollectivePaymentNav } from "../../components/collective-payment-nav/collective-payment-nav";
import { CollectivePaymentForm } from "../../components/collective-payment-form/collective-payment-form";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-add-collective-payment',
  imports: [CollectivePaymentNav, CollectivePaymentForm, SectionWrapper],
  templateUrl: './add-collective-payment.html',
  styleUrl: './add-collective-payment.css',
})
export class AddCollectivePayment {

}
