import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NumbersKeyboardDialog } from './numbers-keyboard-dialog';

describe('NumbersKeyboardDialog', () => {
  let component: NumbersKeyboardDialog;
  let fixture: ComponentFixture<NumbersKeyboardDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NumbersKeyboardDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NumbersKeyboardDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
