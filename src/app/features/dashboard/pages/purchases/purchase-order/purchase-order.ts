import { Component } from '@angular/core';
import { PageHeader } from '../../../../../shared/ui/page-header/page-header';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'app-purchase-order',
  imports: [RouterOutlet],
  templateUrl: './purchase-order.html',
  styleUrl: './purchase-order.scss',
})
export class PurchaseOrder {

}
