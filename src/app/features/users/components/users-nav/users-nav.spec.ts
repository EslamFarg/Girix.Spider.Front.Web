import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersNav } from './users-nav';

describe('UsersNav', () => {
  let component: UsersNav;
  let fixture: ComponentFixture<UsersNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
