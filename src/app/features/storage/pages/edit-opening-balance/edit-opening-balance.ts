import { Component, input } from '@angular/core';
import { BaseComponent, SectionWrapper } from "@/components";
import { OpeningBalanceForm } from "../../components/opening-balance-form/opening-balance-form";

@Component({
  selector: 'app-edit-opening-balance',
  imports: [SectionWrapper, OpeningBalanceForm],
  templateUrl: './edit-opening-balance.html',
  styleUrl: './edit-opening-balance.css',
})
export class EditOpeningBalance extends BaseComponent {
  id=input.required<number>()
}
