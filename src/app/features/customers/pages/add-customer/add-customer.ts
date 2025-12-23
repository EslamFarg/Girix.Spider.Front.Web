import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CustomersNav } from "../../components/customers-nav/customers-nav";
import { CustomersForm } from "../../components/customers-form/customers-form";
import { DeliveriesNav } from "@/features/deliveries/components/deliveries-nav/deliveries-nav";
import { DeliveryManForm } from "@/features/deliveries/components/delivery-man-form/delivery-man-form";

@Component({
  selector: 'app-add-customer',
  imports: [SectionWrapper, CustomersNav, CustomersForm, DeliveriesNav, DeliveryManForm],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer {

}
