import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPeriodicInventoryWarehouse } from './add-periodic-inventory-warehouse';

describe('AddPeriodicInventoryWarehouse', () => {
  let component: AddPeriodicInventoryWarehouse;
  let fixture: ComponentFixture<AddPeriodicInventoryWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPeriodicInventoryWarehouse],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPeriodicInventoryWarehouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
