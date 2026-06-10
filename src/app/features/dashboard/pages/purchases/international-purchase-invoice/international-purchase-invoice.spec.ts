import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternationalPurchaseInvoice } from './international-purchase-invoice';

describe('InternationalPurchaseInvoice', () => {
  let component: InternationalPurchaseInvoice;
  let fixture: ComponentFixture<InternationalPurchaseInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternationalPurchaseInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(InternationalPurchaseInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
