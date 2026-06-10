import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNotification } from './credit-notification';

describe('CreditNotification', () => {
  let component: CreditNotification;
  let fixture: ComponentFixture<CreditNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(CreditNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
