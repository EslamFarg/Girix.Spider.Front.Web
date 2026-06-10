import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstallmentPayment } from './installment-payment';

describe('InstallmentPayment', () => {
  let component: InstallmentPayment;
  let fixture: ComponentFixture<InstallmentPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallmentPayment],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallmentPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
