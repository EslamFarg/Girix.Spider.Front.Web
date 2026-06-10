import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAdjustmentRequest } from './inventory-adjustment-request';

describe('InventoryAdjustmentRequest', () => {
  let component: InventoryAdjustmentRequest;
  let fixture: ComponentFixture<InventoryAdjustmentRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryAdjustmentRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryAdjustmentRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
