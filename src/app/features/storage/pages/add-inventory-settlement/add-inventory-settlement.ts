import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { InventorySettlementForm } from "../../components/inventory-settlement-form/inventory-settlement-form";

@Component({
  selector: 'app-add-inventory-settlement',
  imports: [InventorySettlementForm],
  templateUrl: './add-inventory-settlement.html',
  styleUrl: './add-inventory-settlement.css',
})
export class AddInventorySettlement extends BaseComponent {
  id=input.required<number>()
}
