import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectivePayments } from './collective-payments';

describe('CollectivePayments', () => {
  let component: CollectivePayments;
  let fixture: ComponentFixture<CollectivePayments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectivePayments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectivePayments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
