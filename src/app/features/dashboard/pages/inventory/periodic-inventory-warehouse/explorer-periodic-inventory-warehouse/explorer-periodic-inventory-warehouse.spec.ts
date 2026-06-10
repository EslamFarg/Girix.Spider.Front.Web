import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerPeriodicInventoryWarehouse } from './explorer-periodic-inventory-warehouse';

describe('ExplorerPeriodicInventoryWarehouse', () => {
  let component: ExplorerPeriodicInventoryWarehouse;
  let fixture: ComponentFixture<ExplorerPeriodicInventoryWarehouse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerPeriodicInventoryWarehouse],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerPeriodicInventoryWarehouse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
