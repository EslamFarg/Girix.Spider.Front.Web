import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDepitNotification } from './add-depit-notification';

describe('AddDepitNotification', () => {
  let component: AddDepitNotification;
  let fixture: ComponentFixture<AddDepitNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDepitNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDepitNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
