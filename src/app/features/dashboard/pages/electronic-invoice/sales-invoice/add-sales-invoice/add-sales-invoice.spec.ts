import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSalesInvoice } from './add-sales-invoice';

describe('AddSalesInvoice', () => {
  let component: AddSalesInvoice;
  let fixture: ComponentFixture<AddSalesInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSalesInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSalesInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
