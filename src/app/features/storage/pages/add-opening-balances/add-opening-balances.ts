import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { OpeningBalancesForm } from '../../components/opening-balances-form/opening-balances-form';

@Component({
  selector: 'app-add-opening-balances',
  imports: [SectionWrapper, OpeningBalancesForm],
  templateUrl: './add-opening-balances.html',
  styleUrl: './add-opening-balances.css',
})
export class AddOpeningBalances {}
