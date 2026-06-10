import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseReturnsWithoutInvoiceNumber } from './purchase-returns-without-invoice-number';

describe('PurchaseReturnsWithoutInvoiceNumber', () => {
  let component: PurchaseReturnsWithoutInvoiceNumber;
  let fixture: ComponentFixture<PurchaseReturnsWithoutInvoiceNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseReturnsWithoutInvoiceNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseReturnsWithoutInvoiceNumber);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
