import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerDailyEntry } from './explorer-daily-entry';

describe('ExplorerDailyEntry', () => {
  let component: ExplorerDailyEntry;
  let fixture: ComponentFixture<ExplorerDailyEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerDailyEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerDailyEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
