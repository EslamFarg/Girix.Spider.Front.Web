import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepitNotification } from './depit-notification';

describe('DepitNotification', () => {
  let component: DepitNotification;
  let fixture: ComponentFixture<DepitNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepitNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(DepitNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
