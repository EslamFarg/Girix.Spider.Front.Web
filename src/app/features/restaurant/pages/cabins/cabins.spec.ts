import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cabins } from './cabins';

describe('Cabins', () => {
  let component: Cabins;
  let fixture: ComponentFixture<Cabins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cabins]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cabins);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
