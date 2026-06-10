import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BranchSettings } from './branch-settings';

describe('BranchSettings', () => {
  let component: BranchSettings;
  let fixture: ComponentFixture<BranchSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
