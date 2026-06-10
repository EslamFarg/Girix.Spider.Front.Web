import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeriodicInventoryWarehouse } from './periodic-inventory-warehouse';

describe('PeriodicInventoryWarehouse', () => {
  let component: PeriodicInventoryWarehouse;
  let fixture: ComponentFixture<PeriodicInventoryWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeriodicInventoryWarehouse],
    }).compileComponents();

    fixture = TestBed.createComponent(PeriodicInventoryWarehouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
