import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryAdjustmentRequest } from './add-inventory-adjustment-request';

describe('AddInventoryAdjustmentRequest', () => {
  let component: AddInventoryAdjustmentRequest;
  let fixture: ComponentFixture<AddInventoryAdjustmentRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryAdjustmentRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInventoryAdjustmentRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
