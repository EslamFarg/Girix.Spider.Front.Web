import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreePermissions } from './tree-permissions';

describe('TreePermissions', () => {
  let component: TreePermissions;
  let fixture: ComponentFixture<TreePermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreePermissions],
    }).compileComponents();

    fixture = TestBed.createComponent(TreePermissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
