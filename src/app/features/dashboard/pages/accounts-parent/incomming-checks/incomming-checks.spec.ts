import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncommingChecks } from './incomming-checks';

describe('IncommingChecks', () => {
  let component: IncommingChecks;
  let fixture: ComponentFixture<IncommingChecks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncommingChecks],
    }).compileComponents();

    fixture = TestBed.createComponent(IncommingChecks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
