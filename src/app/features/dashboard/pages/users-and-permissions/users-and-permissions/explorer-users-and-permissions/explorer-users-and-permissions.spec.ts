import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerUsersAndPermissions } from './explorer-users-and-permissions';

describe('ExplorerUsersAndPermissions', () => {
  let component: ExplorerUsersAndPermissions;
  let fixture: ComponentFixture<ExplorerUsersAndPermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerUsersAndPermissions],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerUsersAndPermissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
