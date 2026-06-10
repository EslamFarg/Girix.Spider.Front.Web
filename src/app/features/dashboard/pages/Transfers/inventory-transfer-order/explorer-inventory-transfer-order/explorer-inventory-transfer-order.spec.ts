import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInventoryTransferOrder } from './explorer-inventory-transfer-order';

describe('ExplorerInventoryTransferOrder', () => {
  let component: ExplorerInventoryTransferOrder;
  let fixture: ComponentFixture<ExplorerInventoryTransferOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInventoryTransferOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInventoryTransferOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
