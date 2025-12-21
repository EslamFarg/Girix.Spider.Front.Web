import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomersNav } from './customers-nav';

describe('CustomersNav', () => {
  let component: CustomersNav;
  let fixture: ComponentFixture<CustomersNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomersNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomersNav);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
