import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPurchaseReturnsWithoutInvoiceNumber } from './add-purchase-returns-without-invoice-number';

describe('AddPurchaseReturnsWithoutInvoiceNumber', () => {
  let component: AddPurchaseReturnsWithoutInvoiceNumber;
  let fixture: ComponentFixture<AddPurchaseReturnsWithoutInvoiceNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddPurchaseReturnsWithoutInvoiceNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(AddPurchaseReturnsWithoutInvoiceNumber);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
