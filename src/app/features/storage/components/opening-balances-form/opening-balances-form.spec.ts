import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpeningBalancesForm } from './opening-balances-form';

describe('OpeningBalancesForm', () => {
  let component: OpeningBalancesForm;
  let fixture: ComponentFixture<OpeningBalancesForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpeningBalancesForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpeningBalancesForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
