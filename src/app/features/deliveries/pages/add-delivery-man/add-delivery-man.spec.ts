import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDeliveryMan } from './add-delivery-man';

describe('AddDeliveryMan', () => {
  let component: AddDeliveryMan;
  let fixture: ComponentFixture<AddDeliveryMan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDeliveryMan]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddDeliveryMan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
