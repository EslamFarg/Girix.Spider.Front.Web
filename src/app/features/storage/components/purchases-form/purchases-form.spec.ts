import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchasesForm } from './purchases-form';

describe('PurchasesForm', () => {
  let component: PurchasesForm;
  let fixture: ComponentFixture<PurchasesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchasesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchasesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
