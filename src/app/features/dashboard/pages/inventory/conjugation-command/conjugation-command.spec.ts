import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConjugationCommand } from './conjugation-command';

describe('ConjugationCommand', () => {
  let component: ConjugationCommand;
  let fixture: ComponentFixture<ConjugationCommand>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConjugationCommand],
    }).compileComponents();

    fixture = TestBed.createComponent(ConjugationCommand);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
