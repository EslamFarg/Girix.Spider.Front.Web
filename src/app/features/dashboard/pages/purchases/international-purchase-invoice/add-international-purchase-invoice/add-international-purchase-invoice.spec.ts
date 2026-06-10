import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInternationalPurchaseInvoice } from './add-international-purchase-invoice';

describe('AddInternationalPurchaseInvoice', () => {
  let component: AddInternationalPurchaseInvoice;
  let fixture: ComponentFixture<AddInternationalPurchaseInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInternationalPurchaseInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInternationalPurchaseInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
