import { BaseComponent } from '@/components';
import { Component, input } from '@angular/core';
import { InventorySettlementForm } from '../../components/inventory-settlement-form/inventory-settlement-form';

@Component({
  selector: 'app-edit-inventory-settlement',
  imports: [InventorySettlementForm],
  templateUrl: './edit-inventory-settlement.html',
  styleUrl: './edit-inventory-settlement.css',
})
export class EditInventorySettlement extends BaseComponent {
  id = input.required<number>();
}
