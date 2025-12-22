import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCollectivePayment } from './add-collective-payment';

describe('AddCollectivePayment', () => {
  let component: AddCollectivePayment;
  let fixture: ComponentFixture<AddCollectivePayment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCollectivePayment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCollectivePayment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
