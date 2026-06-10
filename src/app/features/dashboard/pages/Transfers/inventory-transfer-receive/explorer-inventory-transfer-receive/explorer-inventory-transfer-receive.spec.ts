import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInventoryTransferReceive } from './explorer-inventory-transfer-receive';

describe('ExplorerInventoryTransferReceive', () => {
  let component: ExplorerInventoryTransferReceive;
  let fixture: ComponentFixture<ExplorerInventoryTransferReceive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInventoryTransferReceive],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInventoryTransferReceive);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
