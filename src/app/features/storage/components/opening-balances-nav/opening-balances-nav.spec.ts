import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningBalancesNav } from './opening-balances-nav';

describe('OpeningBalancesNav', () => {
  let component: OpeningBalancesNav;
  let fixture: ComponentFixture<OpeningBalancesNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningBalancesNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningBalancesNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
