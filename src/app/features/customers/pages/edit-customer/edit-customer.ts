import { Component } from '@angular/core';
import { CustomersNav } from "../../components/customers-nav/customers-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CustomersForm } from "../../components/customers-form/customers-form";

@Component({
  selector: 'app-edit-customer',
  imports: [CustomersNav, SectionWrapper, CustomersForm],
  templateUrl: './edit-customer.html',
  styleUrl: './edit-customer.css',
})
export class EditCustomer {

}
