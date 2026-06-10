import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryGoods } from './delivery-goods';

describe('DeliveryGoods', () => {
  let component: DeliveryGoods;
  let fixture: ComponentFixture<DeliveryGoods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveryGoods],
    }).compileComponents();

    fixture = TestBed.createComponent(DeliveryGoods);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
