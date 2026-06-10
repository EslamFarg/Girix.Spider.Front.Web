import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddAutometedPurchaseOrder } from './add-autometed-purchase-order';

describe('AddAutometedPurchaseOrder', () => {
  let component: AddAutometedPurchaseOrder;
  let fixture: ComponentFixture<AddAutometedPurchaseOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddAutometedPurchaseOrder],
    }).compileComponents();

    fixture = TestBed.createComponent(AddAutometedPurchaseOrder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
