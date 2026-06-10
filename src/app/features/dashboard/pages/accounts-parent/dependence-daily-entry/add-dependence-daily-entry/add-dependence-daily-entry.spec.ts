import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDependenceDailyEntry } from './add-dependence-daily-entry';

describe('AddDependenceDailyEntry', () => {
  let component: AddDependenceDailyEntry;
  let fixture: ComponentFixture<AddDependenceDailyEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDependenceDailyEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDependenceDailyEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
