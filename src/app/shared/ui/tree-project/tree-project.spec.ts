import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeProject } from './tree-project';

describe('TreeProject', () => {
  let component: TreeProject;
  let fixture: ComponentFixture<TreeProject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeProject],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeProject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
