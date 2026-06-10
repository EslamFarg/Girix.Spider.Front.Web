import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Thedelegate } from './thedelegate';

describe('Thedelegate', () => {
  let component: Thedelegate;
  let fixture: ComponentFixture<Thedelegate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Thedelegate],
    }).compileComponents();

    fixture = TestBed.createComponent(Thedelegate);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
