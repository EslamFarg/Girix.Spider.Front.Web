import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Printer } from './printer';

describe('Printer', () => {
  let component: Printer;
  let fixture: ComponentFixture<Printer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Printer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Printer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
