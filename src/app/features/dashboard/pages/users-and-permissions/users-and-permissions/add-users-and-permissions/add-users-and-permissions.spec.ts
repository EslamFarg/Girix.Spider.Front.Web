import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUsersAndPermissions } from './add-users-and-permissions';

describe('AddUsersAndPermissions', () => {
  let component: AddUsersAndPermissions;
  let fixture: ComponentFixture<AddUsersAndPermissions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUsersAndPermissions],
    }).compileComponents();

    fixture = TestBed.createComponent(AddUsersAndPermissions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
