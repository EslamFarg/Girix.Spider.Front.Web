import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddGroup } from './add-group';

describe('AddGroup', () => {
  let component: AddGroup;
  let fixture: ComponentFixture<AddGroup>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddGroup]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddGroup);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
