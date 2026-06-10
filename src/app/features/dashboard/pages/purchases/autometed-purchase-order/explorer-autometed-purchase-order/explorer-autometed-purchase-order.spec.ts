import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerAutometedPurchaseOrder } from './explorer-autometed-purchase-order';

describe('ExplorerAutometedPurchaseOrder', () => {
  let component: ExplorerAutometedPurchaseOrder;
  let fixture: ComponentFixture<ExplorerAutometedPurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerAutometedPurchaseOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerAutometedPurchaseOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
