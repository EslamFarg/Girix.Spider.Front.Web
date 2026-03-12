import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyJournal } from './daily-journal';

describe('DailyJournal', () => {
  let component: DailyJournal;
  let fixture: ComponentFixture<DailyJournal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyJournal],
    }).compileComponents();

    fixture = TestBed.createComponent(DailyJournal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
