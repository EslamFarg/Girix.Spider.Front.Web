import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronicInvoice } from './electronic-invoice';

describe('ElectronicInvoice', () => {
  let component: ElectronicInvoice;
  let fixture: ComponentFixture<ElectronicInvoice>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ElectronicInvoice],
    }).compileComponents();

    fixture = TestBed.createComponent(ElectronicInvoice);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
