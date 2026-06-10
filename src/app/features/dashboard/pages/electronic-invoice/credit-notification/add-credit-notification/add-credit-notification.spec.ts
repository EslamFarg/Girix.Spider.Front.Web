import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCreditNotification } from './add-credit-notification';

describe('AddCreditNotification', () => {
  let component: AddCreditNotification;
  let fixture: ComponentFixture<AddCreditNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCreditNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCreditNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
