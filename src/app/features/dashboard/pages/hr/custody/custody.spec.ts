import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Custody } from './custody';

describe('Custody', () => {
  let component: Custody;
  let fixture: ComponentFixture<Custody>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Custody],
    }).compileComponents();

    fixture = TestBed.createComponent(Custody);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
