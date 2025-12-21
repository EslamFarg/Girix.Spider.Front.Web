import { Component } from '@angular/core';
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { CustomersNav } from "../../components/customers-nav/customers-nav";
import { CustomersForm } from "../../components/customers-form/customers-form";

@Component({
  selector: 'app-add-customer',
  imports: [SectionWrapper, CustomersNav, CustomersForm],
  templateUrl: './add-customer.html',
  styleUrl: './add-customer.css',
})
export class AddCustomer {

}
