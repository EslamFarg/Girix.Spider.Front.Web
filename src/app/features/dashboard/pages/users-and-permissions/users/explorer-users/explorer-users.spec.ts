import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExplorerUsers } from './explorer-users';

describe('ExplorerUsers', () => {
  let component: ExplorerUsers;
  let fixture: ComponentFixture<ExplorerUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExplorerUsers],
    }).compileComponents();

    fixture = TestBed.createComponent(ExplorerUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
