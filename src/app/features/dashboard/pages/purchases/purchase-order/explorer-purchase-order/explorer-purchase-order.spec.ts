import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerPurchaseOrder } from './explorer-purchase-order';

describe('ExplorerPurchaseOrder', () => {
  let component: ExplorerPurchaseOrder;
  let fixture: ComponentFixture<ExplorerPurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerPurchaseOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerPurchaseOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
