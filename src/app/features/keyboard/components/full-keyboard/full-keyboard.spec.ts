import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullKeyboard } from './full-keyboard';

describe('FullKeyboard', () => {
  let component: FullKeyboard;
  let fixture: ComponentFixture<FullKeyboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullKeyboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullKeyboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
