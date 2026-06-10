import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInventoryAdjustmentRequest } from './explorer-inventory-adjustment-request';

describe('ExplorerInventoryAdjustmentRequest', () => {
  let component: ExplorerInventoryAdjustmentRequest;
  let fixture: ComponentFixture<ExplorerInventoryAdjustmentRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInventoryAdjustmentRequest],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInventoryAdjustmentRequest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
