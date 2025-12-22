import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectivePaymentForm } from './collective-payment-form';

describe('CollectivePaymentForm', () => {
  let component: CollectivePaymentForm;
  let fixture: ComponentFixture<CollectivePaymentForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectivePaymentForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectivePaymentForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
