import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTransferOrder } from './inventory-transfer-order';

describe('InventoryTransferOrder', () => {
  let component: InventoryTransferOrder;
  let fixture: ComponentFixture<InventoryTransferOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTransferOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryTransferOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
