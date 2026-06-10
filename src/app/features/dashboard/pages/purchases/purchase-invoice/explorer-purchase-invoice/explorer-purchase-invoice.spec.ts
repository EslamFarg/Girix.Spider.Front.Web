import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerPurchaseInvoice } from './explorer-purchase-invoice';

describe('ExplorerPurchaseInvoice', () => {
  let component: ExplorerPurchaseInvoice;
  let fixture: ComponentFixture<ExplorerPurchaseInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerPurchaseInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerPurchaseInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
