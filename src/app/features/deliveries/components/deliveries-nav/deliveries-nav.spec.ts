import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveriesNav } from './deliveries-nav';

describe('DeliveriesNav', () => {
  let component: DeliveriesNav;
  let fixture: ComponentFixture<DeliveriesNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeliveriesNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeliveriesNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
