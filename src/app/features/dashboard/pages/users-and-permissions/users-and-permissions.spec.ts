import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersAndPermissions } from './users-and-permissions';

describe('UsersAndPermissions', () => {
  let component: UsersAndPermissions;
  let fixture: ComponentFixture<UsersAndPermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAndPermissions],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersAndPermissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
