import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDailyEntry } from './add-daily-entry';

describe('AddDailyEntry', () => {
  let component: AddDailyEntry;
  let fixture: ComponentFixture<AddDailyEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDailyEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDailyEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
