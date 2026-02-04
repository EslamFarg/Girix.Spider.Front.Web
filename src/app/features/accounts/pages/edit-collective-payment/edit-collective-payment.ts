import { Component } from '@angular/core';
 import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CollectivePaymentForm } from "../../components/collective-payment-form/collective-payment-form";

@Component({
  selector: 'app-edit-collective-payment',
  imports: [ SectionWrapper, CollectivePaymentForm],
  templateUrl: './edit-collective-payment.html',
  styleUrl: './edit-collective-payment.css',
})
export class EditCollectivePayment {

}
