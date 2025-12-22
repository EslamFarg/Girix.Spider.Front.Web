import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectivePaymentNav } from './collective-payment-nav';

describe('CollectivePaymentNav', () => {
  let component: CollectivePaymentNav;
  let fixture: ComponentFixture<CollectivePaymentNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectivePaymentNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectivePaymentNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
