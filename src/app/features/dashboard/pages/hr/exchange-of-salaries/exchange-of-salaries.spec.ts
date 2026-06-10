import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeOfSalaries } from './exchange-of-salaries';

describe('ExchangeOfSalaries', () => {
  let component: ExchangeOfSalaries;
  let fixture: ComponentFixture<ExchangeOfSalaries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangeOfSalaries],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeOfSalaries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
