import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramNav } from './program-nav';

describe('ProgramNav', () => {
  let component: ProgramNav;
  let fixture: ComponentFixture<ProgramNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgramNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
