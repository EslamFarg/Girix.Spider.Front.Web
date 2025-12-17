import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsNav } from './groups-nav';

describe('GroupsNav', () => {
  let component: GroupsNav;
  let fixture: ComponentFixture<GroupsNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
