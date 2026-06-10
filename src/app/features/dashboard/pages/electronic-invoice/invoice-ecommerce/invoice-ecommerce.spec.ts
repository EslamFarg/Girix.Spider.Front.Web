import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceEcommerce } from './invoice-ecommerce';

describe('InvoiceEcommerce', () => {
  let component: InvoiceEcommerce;
  let fixture: ComponentFixture<InvoiceEcommerce>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoiceEcommerce],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceEcommerce);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
