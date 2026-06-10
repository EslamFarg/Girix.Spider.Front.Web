import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Addition } from './addition';

describe('Addition', () => {
  let component: Addition;
  let fixture: ComponentFixture<Addition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Addition],
    }).compileComponents();

    fixture = TestBed.createComponent(Addition);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
