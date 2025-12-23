import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryMen } from './delivery-men';

describe('DeliveryMen', () => {
  let component: DeliveryMen;
  let fixture: ComponentFixture<DeliveryMen>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryMen]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveryMen);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
