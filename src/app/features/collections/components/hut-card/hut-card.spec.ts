import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HutCard } from './hut-card';

describe('HutCard', () => {
  let component: HutCard;
  let fixture: ComponentFixture<HutCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HutCard],
    }).compileComponents();

    fixture = TestBed.createComponent(HutCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
