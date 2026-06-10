import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDependenceDailyEntry } from './explorer-dependence-daily-entry';

describe('ExplorerDependenceDailyEntry', () => {
  let component: ExplorerDependenceDailyEntry;
  let fixture: ComponentFixture<ExplorerDependenceDailyEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDependenceDailyEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDependenceDailyEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
