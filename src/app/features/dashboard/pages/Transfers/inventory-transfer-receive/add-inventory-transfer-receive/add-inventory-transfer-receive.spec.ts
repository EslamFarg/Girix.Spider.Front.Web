import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInventoryTransferReceive } from './add-inventory-transfer-receive';

describe('AddInventoryTransferReceive', () => {
  let component: AddInventoryTransferReceive;
  let fixture: ComponentFixture<AddInventoryTransferReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInventoryTransferReceive],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInventoryTransferReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
