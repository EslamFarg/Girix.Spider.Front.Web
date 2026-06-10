import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutometedPurchaseOrder } from './autometed-purchase-order';

describe('AutometedPurchaseOrder', () => {
  let component: AutometedPurchaseOrder;
  let fixture: ComponentFixture<AutometedPurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutometedPurchaseOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(AutometedPurchaseOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
