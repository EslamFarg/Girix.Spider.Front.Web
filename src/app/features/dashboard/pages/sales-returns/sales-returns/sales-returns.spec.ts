import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReturns } from './sales-returns';

describe('SalesReturns', () => {
  let component: SalesReturns;
  let fixture: ComponentFixture<SalesReturns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesReturns],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesReturns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
