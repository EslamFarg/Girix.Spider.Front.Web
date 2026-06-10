import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExlorerConjugationCommand } from './exlorer-conjugation-command';

describe('ExlorerConjugationCommand', () => {
  let component: ExlorerConjugationCommand;
  let fixture: ComponentFixture<ExlorerConjugationCommand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExlorerConjugationCommand],
    }).compileComponents();

    fixture = TestBed.createComponent(ExlorerConjugationCommand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
