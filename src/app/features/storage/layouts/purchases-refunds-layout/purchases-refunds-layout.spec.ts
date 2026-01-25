import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesRefundsLayout } from './purchases-refunds-layout';

describe('PurchasesRefundsLayout', () => {
  let component: PurchasesRefundsLayout;
  let fixture: ComponentFixture<PurchasesRefundsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesRefundsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesRefundsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
