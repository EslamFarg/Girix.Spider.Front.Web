import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersLayout } from './users-layout';

describe('UsersLayout', () => {
  let component: UsersLayout;
  let fixture: ComponentFixture<UsersLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
