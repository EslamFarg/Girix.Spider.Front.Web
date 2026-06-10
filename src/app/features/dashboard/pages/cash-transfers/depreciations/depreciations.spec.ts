import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Depreciations } from './depreciations';

describe('Depreciations', () => {
  let component: Depreciations;
  let fixture: ComponentFixture<Depreciations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Depreciations],
    }).compileComponents();

    fixture = TestBed.createComponent(Depreciations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
