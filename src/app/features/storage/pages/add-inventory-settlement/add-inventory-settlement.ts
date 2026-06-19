import { BaseComponent, SectionWrapper } from '@/components';
import { Component } from '@angular/core';
import { InventorySettlementForm } from '../../components/inventory-settlement-form/inventory-settlement-form';

@Component({
  selector: 'app-add-inventory-settlement',
  imports: [SectionWrapper, InventorySettlementForm],
  templateUrl: './add-inventory-settlement.html',
  styleUrl: './add-inventory-settlement.css',
})
export class AddInventorySettlement extends BaseComponent {}
