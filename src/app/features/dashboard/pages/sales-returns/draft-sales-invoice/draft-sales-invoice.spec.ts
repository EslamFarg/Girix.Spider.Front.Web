import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DraftSalesInvoice } from './draft-sales-invoice';

describe('DraftSalesInvoice', () => {
  let component: DraftSalesInvoice;
  let fixture: ComponentFixture<DraftSalesInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraftSalesInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(DraftSalesInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
