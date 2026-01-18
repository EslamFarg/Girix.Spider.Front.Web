import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CabinCard } from './cabin-card';

describe('CabinCard', () => {
  let component: CabinCard;
  let fixture: ComponentFixture<CabinCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CabinCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CabinCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
