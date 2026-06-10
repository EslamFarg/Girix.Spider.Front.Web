import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceYear } from './finance-year';

describe('FinanceYear', () => {
  let component: FinanceYear;
  let fixture: ComponentFixture<FinanceYear>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceYear],
    }).compileComponents();

    fixture = TestBed.createComponent(FinanceYear);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
