import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryManForm } from './delivery-man-form';

describe('DeliveryManForm', () => {
  let component: DeliveryManForm;
  let fixture: ComponentFixture<DeliveryManForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryManForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryManForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
