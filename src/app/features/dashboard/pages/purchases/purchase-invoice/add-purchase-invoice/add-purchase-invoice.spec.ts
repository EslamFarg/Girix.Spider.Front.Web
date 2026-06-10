import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurchaseInvoice } from './add-purchase-invoice';

describe('AddPurchaseInvoice', () => {
  let component: AddPurchaseInvoice;
  let fixture: ComponentFixture<AddPurchaseInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPurchaseInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPurchaseInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
