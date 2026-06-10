import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerPurchaseReturnsWithoutInvoiceNumber } from './explorer-purchase-returns-without-invoice-number';

describe('ExplorerPurchaseReturnsWithoutInvoiceNumber', () => {
  let component: ExplorerPurchaseReturnsWithoutInvoiceNumber;
  let fixture: ComponentFixture<ExplorerPurchaseReturnsWithoutInvoiceNumber>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerPurchaseReturnsWithoutInvoiceNumber],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerPurchaseReturnsWithoutInvoiceNumber);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
