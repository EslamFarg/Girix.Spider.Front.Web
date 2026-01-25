import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningBalancesLayout } from './opening-balances-layout';

describe('OpeningBalancesLayout', () => {
  let component: OpeningBalancesLayout;
  let fixture: ComponentFixture<OpeningBalancesLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningBalancesLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningBalancesLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
