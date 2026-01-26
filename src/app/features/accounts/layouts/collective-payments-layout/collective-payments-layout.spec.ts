import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectivePaymentsLayout } from './collective-payments-layout';

describe('CollectivePaymentsLayout', () => {
  let component: CollectivePaymentsLayout;
  let fixture: ComponentFixture<CollectivePaymentsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectivePaymentsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CollectivePaymentsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
