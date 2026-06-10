import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalExchangePermit } from './internal-exchange-permit';

describe('InternalExchangePermit', () => {
  let component: InternalExchangePermit;
  let fixture: ComponentFixture<InternalExchangePermit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalExchangePermit],
    }).compileComponents();

    fixture = TestBed.createComponent(InternalExchangePermit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
