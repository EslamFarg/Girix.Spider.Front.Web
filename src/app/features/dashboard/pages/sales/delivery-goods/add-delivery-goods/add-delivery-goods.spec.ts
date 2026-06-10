import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeliveryGoods } from './add-delivery-goods';

describe('AddDeliveryGoods', () => {
  let component: AddDeliveryGoods;
  let fixture: ComponentFixture<AddDeliveryGoods>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDeliveryGoods],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDeliveryGoods);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
