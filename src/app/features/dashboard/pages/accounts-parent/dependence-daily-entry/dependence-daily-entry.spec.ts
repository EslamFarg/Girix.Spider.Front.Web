import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DependenceDailyEntry } from './dependence-daily-entry';

describe('DependenceDailyEntry', () => {
  let component: DependenceDailyEntry;
  let fixture: ComponentFixture<DependenceDailyEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DependenceDailyEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(DependenceDailyEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
