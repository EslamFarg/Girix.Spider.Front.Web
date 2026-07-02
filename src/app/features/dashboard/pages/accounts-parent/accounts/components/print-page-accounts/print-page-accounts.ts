import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-print-page-accounts',
  imports: [],
  templateUrl: './print-page-accounts.html',
  styleUrl: './print-page-accounts.scss',
})
export class PrintPageAccounts {

  @Input() accountData: any;
}
