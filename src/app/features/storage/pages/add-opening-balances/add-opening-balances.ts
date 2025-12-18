import { Component } from '@angular/core';
import { OpeningBalancesNav } from "../../components/opening-balances-nav/opening-balances-nav";
import { SectionWrapper } from "@/components/section-wrapper/section-wrapper";
import { OpeningBalancesForm } from "../../components/opening-balances-form/opening-balances-form";

@Component({
  selector: 'app-add-opening-balances',
  imports: [OpeningBalancesNav, SectionWrapper, OpeningBalancesForm],
  templateUrl: './add-opening-balances.html',
  styleUrl: './add-opening-balances.css',
})
export class AddOpeningBalances {

}
