import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerSalesInvoice } from './explorer-sales-invoice';

describe('ExplorerSalesInvoice', () => {
  let component: ExplorerSalesInvoice;
  let fixture: ComponentFixture<ExplorerSalesInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerSalesInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerSalesInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
