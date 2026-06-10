import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerInternationalPurchaseInvoice } from './explorer-international-purchase-invoice';

describe('ExplorerInternationalPurchaseInvoice', () => {
  let component: ExplorerInternationalPurchaseInvoice;
  let fixture: ComponentFixture<ExplorerInternationalPurchaseInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerInternationalPurchaseInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerInternationalPurchaseInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
