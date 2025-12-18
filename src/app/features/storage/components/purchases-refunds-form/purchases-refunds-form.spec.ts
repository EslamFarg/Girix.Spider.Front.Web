import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesRefundsForm } from './purchases-refunds-form';

describe('PurchasesRefundsForm', () => {
  let component: PurchasesRefundsForm;
  let fixture: ComponentFixture<PurchasesRefundsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesRefundsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesRefundsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
