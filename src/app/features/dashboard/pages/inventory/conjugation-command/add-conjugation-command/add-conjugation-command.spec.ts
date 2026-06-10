import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConjugationCommand } from './add-conjugation-command';

describe('AddConjugationCommand', () => {
  let component: AddConjugationCommand;
  let fixture: ComponentFixture<AddConjugationCommand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddConjugationCommand],
    }).compileComponents();

    fixture = TestBed.createComponent(AddConjugationCommand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
