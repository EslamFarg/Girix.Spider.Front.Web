import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintableOrderInvoice } from './printable-order-invoice';

describe('PrintableOrderInvoice', () => {
  let component: PrintableOrderInvoice;
  let fixture: ComponentFixture<PrintableOrderInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrintableOrderInvoice]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrintableOrderInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
