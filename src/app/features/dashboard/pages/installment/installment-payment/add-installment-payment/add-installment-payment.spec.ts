import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInstallmentPayment } from './add-installment-payment';

describe('AddInstallmentPayment', () => {
  let component: AddInstallmentPayment;
  let fixture: ComponentFixture<AddInstallmentPayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddInstallmentPayment],
    }).compileComponents();

    fixture = TestBed.createComponent(AddInstallmentPayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
