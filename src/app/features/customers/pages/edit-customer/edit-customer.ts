import { Component } from '@angular/core';
import { CustomersNav } from "../../components/customers-nav/customers-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CustomersForm } from "../../components/customers-form/customers-form";
import { DeliveriesNav } from "@/features/deliveries/components/deliveries-nav/deliveries-nav";
import { DeliveryManForm } from "@/features/deliveries/components/delivery-man-form/delivery-man-form";

@Component({
  selector: 'app-edit-customer',
  imports: [CustomersNav, SectionWrapper, CustomersForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomer {

}
