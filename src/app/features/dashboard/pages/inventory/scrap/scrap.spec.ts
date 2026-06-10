import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Scrap } from './scrap';

describe('Scrap', () => {
  let component: Scrap;
  let fixture: ComponentFixture<Scrap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Scrap],
    }).compileComponents();

    fixture = TestBed.createComponent(Scrap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
