import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTransferReceive } from './inventory-transfer-receive';

describe('InventoryTransferReceive', () => {
  let component: InventoryTransferReceive;
  let fixture: ComponentFixture<InventoryTransferReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTransferReceive],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryTransferReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
