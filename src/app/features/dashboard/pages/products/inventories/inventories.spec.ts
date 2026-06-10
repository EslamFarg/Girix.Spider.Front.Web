import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Inventories } from './inventories';

describe('Inventories', () => {
  let component: Inventories;
  let fixture: ComponentFixture<Inventories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Inventories],
    }).compileComponents();

    fixture = TestBed.createComponent(Inventories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
