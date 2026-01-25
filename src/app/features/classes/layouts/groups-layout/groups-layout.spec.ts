import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsLayout } from './groups-layout';

describe('GroupsLayout', () => {
  let component: GroupsLayout;
  let fixture: ComponentFixture<GroupsLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupsLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupsLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
