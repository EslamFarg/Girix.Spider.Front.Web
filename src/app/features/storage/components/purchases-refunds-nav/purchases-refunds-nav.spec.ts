import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesRefundsNav } from './purchases-refunds-nav';

describe('PurchasesRefundsNav', () => {
  let component: PurchasesRefundsNav;
  let fixture: ComponentFixture<PurchasesRefundsNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesRefundsNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesRefundsNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
