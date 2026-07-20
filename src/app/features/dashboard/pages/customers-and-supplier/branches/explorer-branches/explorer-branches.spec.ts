import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerBranches } from './explorer-branches';

describe('ExplorerBranches', () => {
  let component: ExplorerBranches;
  let fixture: ComponentFixture<ExplorerBranches>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerBranches],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerBranches);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
