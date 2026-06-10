import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisbursingReservations } from './disbursing-reservations';

describe('DisbursingReservations', () => {
  let component: DisbursingReservations;
  let fixture: ComponentFixture<DisbursingReservations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisbursingReservations],
    }).compileComponents();

    fixture = TestBed.createComponent(DisbursingReservations);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
