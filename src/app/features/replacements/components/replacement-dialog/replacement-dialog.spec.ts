import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplacementDialog } from './replacement-dialog';

describe('ReplacementDialog', () => {
  let component: ReplacementDialog;
  let fixture: ComponentFixture<ReplacementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplacementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplacementDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
