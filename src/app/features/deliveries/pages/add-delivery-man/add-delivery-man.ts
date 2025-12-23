import { Component } from '@angular/core';
import { DeliveryManForm } from "../../components/delivery-man-form/delivery-man-form";
import { DeliveriesNav } from "../../components/deliveries-nav/deliveries-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";

@Component({
  selector: 'app-add-delivery-man',
  imports: [DeliveryManForm, DeliveriesNav, SectionWrapper],
  templateUrl: './add-delivery-man.html',
  styleUrl: './add-delivery-man.css',
})
export class AddDeliveryMan {

}
