import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Huts } from './huts';

describe('Huts', () => {
  let component: Huts;
  let fixture: ComponentFixture<Huts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Huts],
    }).compileComponents();

    fixture = TestBed.createComponent(Huts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
