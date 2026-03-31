import { Component } from '@angular/core';
import { SectionWrapper } from '@/components/section-wrapper/section-wrapper';
import { OpeningBalanceForm } from '../../components/opening-balance-form/opening-balance-form';
import { BaseComponent } from '@/components';

@Component({
  selector: 'app-add-opening-balance',
  imports: [SectionWrapper, OpeningBalanceForm],
  templateUrl: './add-opening-balance.html',
  styleUrl: './add-opening-balance.css',
})
export class AddOpeningBalance extends BaseComponent {

}
