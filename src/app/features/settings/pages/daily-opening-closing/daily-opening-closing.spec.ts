import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyOpeningClosing } from './daily-opening-closing';

describe('DailyOpeningClosing', () => {
  let component: DailyOpeningClosing;
  let fixture: ComponentFixture<DailyOpeningClosing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyOpeningClosing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyOpeningClosing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
