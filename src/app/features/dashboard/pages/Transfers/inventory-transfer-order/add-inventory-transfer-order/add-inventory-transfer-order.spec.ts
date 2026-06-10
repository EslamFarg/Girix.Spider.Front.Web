import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryTransferOrder } from './add-inventory-transfer-order';

describe('AddInventoryTransferOrder', () => {
  let component: AddInventoryTransferOrder;
  let fixture: ComponentFixture<AddInventoryTransferOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryTransferOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInventoryTransferOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
