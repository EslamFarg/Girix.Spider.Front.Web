import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryAdjustment } from './add-inventory-adjustment';

describe('AddInventoryAdjustment', () => {
  let component: AddInventoryAdjustment;
  let fixture: ComponentFixture<AddInventoryAdjustment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryAdjustment],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInventoryAdjustment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
