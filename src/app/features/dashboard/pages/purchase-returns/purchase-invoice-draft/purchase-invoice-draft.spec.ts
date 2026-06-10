import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseInvoiceDraft } from './purchase-invoice-draft';

describe('PurchaseInvoiceDraft', () => {
  let component: PurchaseInvoiceDraft;
  let fixture: ComponentFixture<PurchaseInvoiceDraft>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseInvoiceDraft],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseInvoiceDraft);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
