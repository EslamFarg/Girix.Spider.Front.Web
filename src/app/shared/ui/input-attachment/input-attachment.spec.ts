import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAttachment } from './input-attachment';

describe('InputAttachment', () => {
  let component: InputAttachment;
  let fixture: ComponentFixture<InputAttachment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAttachment],
    }).compileComponents();

    fixture = TestBed.createComponent(InputAttachment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
